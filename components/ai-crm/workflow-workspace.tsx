"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Circle, Clock3, Loader2, Play, Plus, RotateCcw, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { text, workflowSteps, type LocalizedText } from "@/data/ai-crm";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/crm";

const nodeTypes = ["Trigger", "Action", "Message", "Condition", "Reminder", "Escalation", "AI"] as const;
type WorkflowNodeType = (typeof nodeTypes)[number];
type StepStatus = "idle" | "running" | "success" | "failed";

type WorkflowNode = {
  id: string;
  label: LocalizedText;
  type: WorkflowNodeType;
  locked?: boolean;
};

type RunEvent = {
  id: string;
  index: number;
  status: "success";
  message: string;
  durationMs: number;
};

const copy = {
  zh: {
    builder: "流程编辑器",
    active: "启用中",
    running: "运行中",
    completed: "运行完成",
    addNode: "添加节点",
    run: "运行流程",
    reset: "恢复默认",
    nodeName: "节点名称",
    nodeType: "节点类型",
    addTitle: "添加工作流节点",
    addDescription: "新增节点会加入当前流程配置，并参与后续流程执行。",
    addConfirm: "添加",
    cancel: "取消",
    logTitle: "运行日志",
    logEmpty: "运行流程后，这里会显示每个节点的执行结果。",
    summaryTitle: "运行结果",
    summaryIdle: "等待运行流程",
    summaryRunning: "正在按顺序执行节点",
    summaryDone: "全部节点已成功执行",
    nodeAdded: "节点已添加",
    nodeRemoved: "节点已移除",
    runSuccess: "工作流运行完成",
    runFailed: "工作流运行失败",
    nameRequired: "请输入节点名称",
    enter: "进入",
    note: "运行流程会写入系统活动记录；异步队列、Webhook 和审批任务可按业务需要继续接入。"
  },
  en: {
    builder: "Workflow editor",
    active: "Active",
    running: "Running",
    completed: "Completed",
    addNode: "Add node",
    run: "Run workflow",
    reset: "Reset",
    nodeName: "Node name",
    nodeType: "Node type",
    addTitle: "Add workflow node",
    addDescription: "The node will be added to this workflow configuration and used in future runs.",
    addConfirm: "Add",
    cancel: "Cancel",
    logTitle: "Run log",
    logEmpty: "Run the workflow to see each node result here.",
    summaryTitle: "Run result",
    summaryIdle: "Waiting for workflow run",
    summaryRunning: "Running nodes in order",
    summaryDone: "All nodes completed successfully",
    nodeAdded: "Node added",
    nodeRemoved: "Node removed",
    runSuccess: "Workflow completed",
    runFailed: "Workflow run failed",
    nameRequired: "Enter a node name",
    enter: "Open",
    note: "Workflow runs are written to system activity logs. Queues, webhooks, and approval jobs can be connected as business rules mature."
  },
  id: {
    builder: "Editor workflow",
    active: "Aktif",
    running: "Berjalan",
    completed: "Selesai",
    addNode: "Tambah node",
    run: "Jalankan workflow",
    reset: "Reset",
    nodeName: "Nama node",
    nodeType: "Tipe node",
    addTitle: "Tambah node workflow",
    addDescription: "Node akan ditambahkan ke konfigurasi workflow ini dan dipakai saat workflow dijalankan.",
    addConfirm: "Tambah",
    cancel: "Batal",
    logTitle: "Log run",
    logEmpty: "Jalankan workflow untuk melihat hasil setiap node.",
    summaryTitle: "Hasil run",
    summaryIdle: "Menunggu workflow dijalankan",
    summaryRunning: "Menjalankan node berurutan",
    summaryDone: "Semua node berhasil dijalankan",
    nodeAdded: "Node ditambahkan",
    nodeRemoved: "Node dihapus",
    runSuccess: "Workflow selesai dijalankan",
    runFailed: "Workflow gagal dijalankan",
    nameRequired: "Isi nama node",
    enter: "Buka",
    note: "Setiap workflow run ditulis ke log aktivitas sistem. Queue, webhook, dan approval job dapat dihubungkan sesuai aturan bisnis."
  }
} as const;

function defaultNodes(): WorkflowNode[] {
  return workflowSteps.map((step) => ({
    id: step.id,
    label: step.label,
    type: step.type as WorkflowNodeType,
    locked: true
  }));
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function WorkflowWorkspace({
  locale,
  title,
  description
}: {
  locale: Locale;
  title: string;
  description: string;
}) {
  const page = copy[locale];
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => defaultNodes());
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeType, setNewNodeType] = useState<WorkflowNodeType>("Action");
  const [running, setRunning] = useState(false);
  const [runDone, setRunDone] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>({});

  const storageKey = `homy-workflow-${locale}`;
  const statusLabel = running ? page.running : runDone ? page.completed : page.active;
  const statusVariant = running ? "warning" : runDone ? "success" : "secondary";

  const summary = useMemo(() => {
    if (running) return page.summaryRunning;
    if (runDone) return page.summaryDone;
    return page.summaryIdle;
  }, [page.summaryDone, page.summaryIdle, page.summaryRunning, runDone, running]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WorkflowNode[];
        if (Array.isArray(parsed) && parsed.length) {
          setNodes(parsed);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(nodes));
  }, [nodes, ready, storageKey]);

  function addNode() {
    const name = newNodeName.trim();
    if (!name) {
      toast({ title: page.nameRequired, variant: "destructive" });
      return;
    }

    const node: WorkflowNode = {
      id: `node-${globalThis.crypto.randomUUID()}`,
      label: { zh: name, en: name, id: name },
      type: newNodeType
    };

    setNodes((current) => [...current, node]);
    setStepStatus((current) => ({ ...current, [node.id]: "idle" }));
    setRunDone(false);
    setNewNodeName("");
    setNewNodeType("Action");
    setOpen(false);
    toast({ title: page.nodeAdded });
  }

  function removeNode(id: string) {
    setNodes((current) => current.filter((node) => node.id !== id));
    setRunLogs([]);
    setRunDone(false);
    toast({ title: page.nodeRemoved });
  }

  function resetWorkflow() {
    setNodes(defaultNodes());
    setRunLogs([]);
    setRunDone(false);
    setStepStatus({});
  }

  async function runWorkflow() {
    if (running || !nodes.length) return;
    setRunning(true);
    setRunDone(false);
    setRunLogs([]);
    setStepStatus(Object.fromEntries(nodes.map((node) => [node.id, "idle"])));

    try {
      const response = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          steps: nodes.map((node) => ({
            id: node.id,
            label: text(node.label, locale),
            type: node.type
          }))
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? page.runFailed);
      }

      for (const event of payload.data.events as RunEvent[]) {
        setStepStatus((current) => ({ ...current, [event.id]: "running" }));
        await sleep(Math.min(event.durationMs, 520));
        setStepStatus((current) => ({ ...current, [event.id]: "success" }));
        setRunLogs((current) => [...current, event.message]);
      }

      setRunDone(true);
      toast({ title: page.runSuccess });
    } catch (error) {
      setStepStatus((current) => {
        const active = nodes.find((node) => current[node.id] === "running");
        return active ? { ...current, [active.id]: "failed" } : current;
      });
      toast({ title: page.runFailed, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              {page.addNode}
            </Button>
            <Button onClick={runWorkflow} disabled={running || !nodes.length}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {page.run}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{page.builder}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{page.note}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <Button type="button" variant="ghost" size="sm" onClick={resetWorkflow} disabled={running}>
                <RotateCcw className="size-4" />
                {page.reset}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex w-full flex-col items-center gap-2">
                <WorkflowNodeCard
                  node={node}
                  index={index}
                  locale={locale}
                  status={stepStatus[node.id] ?? "idle"}
                  running={running}
                  enterLabel={page.enter}
                  onRemove={() => removeNode(node.id)}
                />
                {index < nodes.length - 1 ? <ArrowDown className="size-4 text-muted-foreground" /> : null}
              </div>
            ))}
          </div>

          <aside className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{page.summaryTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
              </div>
              <Badge variant="outline">{nodes.length}</Badge>
            </div>
            <div className="mt-5">
              <h3 className="text-sm font-semibold">{page.logTitle}</h3>
              <div className="mt-3 min-h-56 space-y-2">
                {runLogs.length ? (
                  runLogs.map((log, index) => (
                    <div key={`${log}-${index}`} className="rounded-md border bg-background p-3 text-sm">
                      <span className="mr-2 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
                    {page.logEmpty}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{page.addTitle}</DialogTitle>
            <DialogDescription>{page.addDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-node-name">{page.nodeName}</Label>
              <Input
                id="workflow-node-name"
                value={newNodeName}
                onChange={(event) => setNewNodeName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addNode();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>{page.nodeType}</Label>
              <Select value={newNodeType} onValueChange={(value) => setNewNodeType(value as WorkflowNodeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {page.cancel}
            </Button>
            <Button type="button" onClick={addNode}>
              <Plus className="size-4" />
              {page.addConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkflowNodeCard({
  node,
  index,
  locale,
  status,
  running,
  enterLabel,
  onRemove
}: {
  node: WorkflowNode;
  index: number;
  locale: Locale;
  status: StepStatus;
  running: boolean;
  enterLabel: string;
  onRemove: () => void;
}) {
  const Icon = status === "running" ? Loader2 : status === "success" ? CheckCircle2 : status === "failed" ? Clock3 : Circle;
  const href = getNodeHref(node, locale);

  return (
    <div
      className={cn(
        "w-full rounded-md border bg-card p-4 shadow-sm transition",
        status === "running" && "border-primary bg-primary/5",
        status === "success" && "border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
        status === "failed" && "border-destructive bg-destructive/5"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Icon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              status === "running" && "animate-spin text-primary",
              status === "success" && "text-emerald-600",
              status === "failed" && "text-destructive"
            )}
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{text(node.label, locale)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{node.type}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8">
            <Link href={href}>
              {enterLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          {!node.locked ? (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={running} aria-label="Remove node">
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          ) : null}
          <span className="rounded-md bg-muted px-2 py-1 text-xs">{index + 1}</span>
        </div>
      </div>
    </div>
  );
}

function getNodeHref(node: WorkflowNode, locale: Locale) {
  const base = `/${locale}`;
  const fixed: Record<string, string> = {
    trigger: `${base}/customers?create=1`,
    assign: `${base}/sales-assignment`,
    task: `${base}/followup-tasks?create=1`,
    email: `${base}/email-center?template=welcome`,
    wait3: `${base}/condition-monitor?rule=no-contact-3d`,
    remind: `${base}/sales-reminders`,
    wait7: `${base}/condition-monitor?rule=no-quote-7d`,
    manager: `${base}/manager-escalation`,
    ai: `${base}/ai-analysis`
  };

  if (fixed[node.id]) return fixed[node.id];

  const byType: Record<WorkflowNodeType, string> = {
    Trigger: `${base}/customers?create=1`,
    Action: `${base}/customers`,
    Message: `${base}/email-center`,
    Condition: `${base}/condition-monitor`,
    Reminder: `${base}/sales-reminders`,
    Escalation: `${base}/manager-escalation`,
    AI: `${base}/ai-analysis`
  };

  return byType[node.type];
}
