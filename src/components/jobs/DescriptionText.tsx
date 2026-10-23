const BULLET = /^\s*(?:[*•·–-]|\d+[.)])\s+/;

const isBullet = (line: string) => BULLET.test(line);
const isHeading = (line: string) => {
  const text = line.trim();
  return (
    text.length > 0 &&
    text.length <= 60 &&
    !/[.!?,;]$/.test(text) &&
    !isBullet(text)
  );
};

function Bullets({ lines }: { lines: string[] }) {
  return (
    <ul className='list-disc space-y-1.5 pl-5 marker:text-muted'>
      {lines.map((line, i) => (
        <li key={i}>{line.replace(BULLET, '')}</li>
      ))}
    </ul>
  );
}

export function DescriptionText({ text }: { text: string }) {
  const blocks = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line.trim() !== ''),
    )
    .filter((lines) => lines.length > 0);

  return (
    <div className='space-y-4 text-[15px] leading-7 text-ink'>
      {blocks.map((lines, i) => {
        if (lines.every(isBullet)) return <Bullets key={i} lines={lines} />;
        if (lines.length === 1 && isHeading(lines[0])) {
          return (
            <h4 key={i} className='pt-3 text-sm font-semibold text-ink'>
              {lines[0].trim()}
            </h4>
          );
        }
        if (isHeading(lines[0]) && lines.slice(1).every(isBullet)) {
          return (
            <div key={i}>
              <h4 className='pb-2 pt-3 text-sm font-semibold text-ink'>
                {lines[0].trim()}
              </h4>
              <Bullets lines={lines.slice(1)} />
            </div>
          );
        }
        return (
          <p key={i} className='whitespace-pre-line'>
            {lines.join('\n')}
          </p>
        );
      })}
    </div>
  );
}
