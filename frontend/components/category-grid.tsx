import { categories } from "@/lib/data";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {categories.map(({ slug, label, labelNe, icon: Icon }) => (
        <a
          key={slug}
          href="#"
          className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center transition-colors hover:bg-secondary"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 sm:size-14">
            <Icon className="size-6" aria-hidden />
          </span>
          <span className="text-xs font-medium leading-tight text-foreground">
            {label}
            <span className="block text-[11px] font-normal text-muted-foreground">
              {labelNe}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
