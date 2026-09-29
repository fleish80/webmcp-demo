import type { ExplainerLab } from './lab';

const REQUIREMENTS = {
  registered: (lab: ExplainerLab) => lab.registered,
  discovered: (lab: ExplainerLab) => lab.discovered,
  called: (lab: ExplainerLab) => lab.called,
} satisfies Record<string, (lab: ExplainerLab) => boolean>;

/**
 * Sections declare `data-requires="registered|discovered|called"`; this keeps them locked
 * until the lab reaches that state, so every step unlocks the next.
 */
export function installProgress(page: HTMLElement, lab: ExplainerLab): void {
  const gated = page.querySelectorAll<HTMLElement>('[data-requires]');
  const update = () => {
    for (const section of gated) {
      const requirement = section.dataset['requires'] as keyof typeof REQUIREMENTS;
      section.classList.toggle('section-locked', !REQUIREMENTS[requirement](lab));
    }
  };
  lab.subscribe(update);
  update();
}
