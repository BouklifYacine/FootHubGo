import { NumberTicker } from "../ui/number-ticker";


export function NombreAnime() {
  return (
    <NumberTicker
      value={500}
    //   startValue={50} Pour choisir une valeur de départ si on veut 
    // value={5.67}
    //   decimalPlaces={2} Pour choisir des décimales si on veut 
      className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
    />
  );
}
