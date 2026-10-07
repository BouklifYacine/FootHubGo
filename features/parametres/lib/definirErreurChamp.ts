import type { AnyFormApi } from "@tanstack/react-form";

/**
 * Équivalent TanStack Form du `setError` (erreur renvoyée par le serveur sur un champ).
 *
 * L'erreur est stockée dans `errorMap.onDynamic` avec la source "form" :
 * elle est donc effacée à la prochaine validation du schéma (modification du
 * champ après soumission via `revalidateLogic`, ou `form.reset()`).
 */
export function definirErreurChamp(
  form: AnyFormApi,
  champ: string,
  message: string
) {
  form.setFieldMeta(champ, (prev) => ({
    ...prev,
    errorMap: { ...prev.errorMap, onDynamic: [{ message }] },
    errorSourceMap: { ...prev.errorSourceMap, onDynamic: "form" },
  }));
}
