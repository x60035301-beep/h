export type QuotationItemMeta = {
  density: string | null;
  specification: string | null;
  size: string | null;
  note: string | null;
};

export type QuotationItemMetaInput = Partial<Record<keyof QuotationItemMeta, string | null | undefined>>;

const metaPrefix = "__HOMY_QUOTATION_ITEM_META__:";

export function parseQuotationItemNotes(notes: string | null | undefined): QuotationItemMeta {
  if (!notes) return emptyMeta();

  if (!notes.startsWith(metaPrefix)) {
    return { ...emptyMeta(), note: notes };
  }

  try {
    const parsed = JSON.parse(notes.slice(metaPrefix.length)) as QuotationItemMetaInput;

    return {
      density: cleanText(parsed.density),
      specification: cleanText(parsed.specification),
      size: cleanText(parsed.size),
      note: cleanText(parsed.note)
    };
  } catch {
    return { ...emptyMeta(), note: notes };
  }
}

export function serializeQuotationItemNotes(input: QuotationItemMetaInput) {
  const meta: QuotationItemMeta = {
    density: cleanText(input.density),
    specification: cleanText(input.specification),
    size: cleanText(input.size),
    note: cleanText(input.note)
  };

  if (!meta.density && !meta.specification && !meta.size) {
    return meta.note;
  }

  return `${metaPrefix}${JSON.stringify(meta)}`;
}

function emptyMeta(): QuotationItemMeta {
  return {
    density: null,
    specification: null,
    size: null,
    note: null
  };
}

function cleanText(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}
