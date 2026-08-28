const BLOCK_TAG_NAMES = new Set([
  'article',
  'blockquote',
  'div',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

const HIDDEN_TAG_NAMES = new Set(['script', 'style']);

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

interface ParsedTag {
  name: string;
  isClosing: boolean;
}

interface DecodedEntity {
  value: string;
  endIndex: number;
}

const findTagEnd = (value: string, startIndex: number) => {
  let quote: '"' | "'" | null = null;

  for (let index = startIndex + 1; index < value.length; index += 1) {
    const character = value[index];

    if (quote) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === '>') {
      return index;
    }
  }

  return -1;
};

const parseTag = (rawTag: string): ParsedTag | null => {
  let index = 0;

  while (
    rawTag[index] === ' ' ||
    rawTag[index] === '\n' ||
    rawTag[index] === '\t'
  ) {
    index += 1;
  }

  const isClosing = rawTag[index] === '/';
  if (isClosing) {
    index += 1;
  }

  while (
    rawTag[index] === ' ' ||
    rawTag[index] === '\n' ||
    rawTag[index] === '\t'
  ) {
    index += 1;
  }

  const nameStart = index;
  const firstNameCharacter = rawTag[index];
  const startsWithLetter =
    (firstNameCharacter >= 'a' && firstNameCharacter <= 'z') ||
    (firstNameCharacter >= 'A' && firstNameCharacter <= 'Z');

  if (!startsWithLetter) {
    return null;
  }

  while (index < rawTag.length) {
    const character = rawTag[index];
    const isNameCharacter =
      (character >= 'a' && character <= 'z') ||
      (character >= 'A' && character <= 'Z') ||
      (character >= '0' && character <= '9') ||
      character === ':' ||
      character === '-';

    if (!isNameCharacter) {
      break;
    }
    index += 1;
  }

  if (index === nameStart) {
    return null;
  }

  return {
    name: rawTag.slice(nameStart, index).toLowerCase(),
    isClosing,
  };
};

const decodeEntity = (
  value: string,
  startIndex: number
): DecodedEntity | null => {
  const endIndex = value.indexOf(';', startIndex + 1);
  if (endIndex === -1 || endIndex - startIndex > 12) {
    return null;
  }

  const entity = value.slice(startIndex + 1, endIndex);
  const namedValue = NAMED_ENTITIES[entity.toLowerCase()];
  if (namedValue !== undefined) {
    return { value: namedValue, endIndex };
  }

  const isHexadecimal = entity.startsWith('#x') || entity.startsWith('#X');
  const numericValue = isHexadecimal ? entity.slice(2) : entity.slice(1);
  const isNumericEntity = isHexadecimal
    ? entity.startsWith('#') && /^[0-9a-fA-F]+$/.test(numericValue)
    : entity.startsWith('#') && /^\d+$/.test(numericValue);

  if (!isNumericEntity) {
    return null;
  }

  const codePoint = Number.parseInt(numericValue, isHexadecimal ? 16 : 10);
  const isInvalidCodePoint =
    codePoint === 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff);

  if (isInvalidCodePoint) {
    return null;
  }

  return { value: String.fromCodePoint(codePoint), endIndex };
};

const appendLineBreak = (result: string) => {
  if (!result || result.endsWith('\n')) {
    return result;
  }

  return `${result}\n`;
};

const normalizeHtmlWhitespace = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t\f\v ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** HTML을 실행하거나 DOM에 삽입하지 않고, 화면 표시용 일반 텍스트로 변환한다. */
export const htmlToPlainText = (html: string) => {
  let result = '';
  let hiddenTagName: string | null = null;
  let containsHtmlTag = false;

  for (let index = 0; index < html.length; index += 1) {
    if (html.startsWith('<!--', index)) {
      const commentEnd = html.indexOf('-->', index + 4);
      containsHtmlTag = true;
      index = commentEnd === -1 ? html.length : commentEnd + 2;
      continue;
    }

    if (html[index] === '<') {
      const tagEnd = findTagEnd(html, index);
      if (tagEnd !== -1) {
        const parsedTag = parseTag(html.slice(index + 1, tagEnd));

        if (parsedTag) {
          containsHtmlTag = true;

          if (hiddenTagName) {
            if (parsedTag.isClosing && parsedTag.name === hiddenTagName) {
              hiddenTagName = null;
            }
          } else if (
            !parsedTag.isClosing &&
            HIDDEN_TAG_NAMES.has(parsedTag.name)
          ) {
            hiddenTagName = parsedTag.name;
          } else if (
            parsedTag.name === 'br' ||
            BLOCK_TAG_NAMES.has(parsedTag.name)
          ) {
            result = appendLineBreak(result);
          }

          index = tagEnd;
          continue;
        }
      }
    }

    if (hiddenTagName) {
      continue;
    }

    if (html[index] === '&') {
      const decodedEntity = decodeEntity(html, index);
      if (decodedEntity) {
        result += decodedEntity.value;
        index = decodedEntity.endIndex;
        continue;
      }
    }

    result += html[index];
  }

  return containsHtmlTag ? normalizeHtmlWhitespace(result) : result;
};
