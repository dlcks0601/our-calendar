/**
 * 변형 조합표 — 컴포넌트의 종류·크기·상태를 한 곳에 정의하고, 쓰는 쪽은 이름만 고른다.
 * base(항상) + variants(고른 것 하나씩) + compoundVariants(조건이 전부 맞을 때) 순으로 클래스를 붙인다.
 */

type VariantDefs = Record<string, Record<string, string>>;

/** 변형 키가 'true' | 'false'면 boolean으로도 고를 수 있다. */
type Choice<Options> = keyof Options extends 'true' | 'false' ? boolean | keyof Options : keyof Options;

export type Selection<V extends VariantDefs> = { [K in keyof V]?: Choice<V[K]> };

export interface RecipeConfig<V extends VariantDefs> {
  base?: string;
  variants: V;
  compoundVariants?: (Selection<V> & { class: string })[];
  defaultVariants?: Selection<V>;
}

export type RecipeFn<V extends VariantDefs> = (selection?: Selection<V> & { className?: string }) => string;

export function recipe<V extends VariantDefs>(config: RecipeConfig<V>): RecipeFn<V> {
  const names = Object.keys(config.variants) as (keyof V & string)[];

  return (selection = {}) => {
    // 고르지 않은 변형은 기본값으로 채운다. 이후 판단은 전부 이 확정된 값으로 한다.
    const resolved: Record<string, string | undefined> = {};
    for (const name of names) {
      const picked = (selection as Record<string, unknown>)[name] ?? (config.defaultVariants as Record<string, unknown> | undefined)?.[name];
      resolved[name] = picked === undefined ? undefined : String(picked);
    }

    const classes: (string | undefined)[] = [config.base];
    for (const name of names) {
      const key = resolved[name];
      if (key !== undefined) classes.push(config.variants[name][key]);
    }
    for (const { class: compoundClass, ...conditions } of config.compoundVariants ?? []) {
      const matches = Object.entries(conditions).every(([name, value]) => resolved[name] === String(value));
      if (matches) classes.push(compoundClass);
    }
    classes.push(selection.className);

    return classes.filter(Boolean).join(' ');
  };
}
