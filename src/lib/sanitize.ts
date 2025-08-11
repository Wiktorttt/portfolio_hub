// Minimal client-side sanitization helper for rendering HTML from trusted sources.
// For stronger security, consider server-side sanitization.

const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'style']);
const BLOCKED_ATTR_PREFIXES = ['on']; // onclick, onload, etc.
const BLOCKED_ATTRS = new Set(['srcdoc']);

export function sanitizeHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    const toRemove: Element[] = [];

    while (walker.nextNode()) {
      const el = walker.currentNode as Element;

      if (BLOCKED_TAGS.has(el.tagName.toLowerCase())) {
        toRemove.push(el);
        continue;
      }

      // Remove event handler attributes and dangerous attrs
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (BLOCKED_ATTRS.has(name)) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (BLOCKED_ATTR_PREFIXES.some((p) => name.startsWith(p))) {
          el.removeAttribute(attr.name);
        }
      }
    }

    for (const el of toRemove) {
      el.remove();
    }

    return doc.body.innerHTML;
  } catch {
    return '';
  }
}


