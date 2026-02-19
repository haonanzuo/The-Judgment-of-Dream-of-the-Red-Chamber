type DisclaimerProps = {
  compact?: boolean;
};

export function Disclaimer({ compact = false }: DisclaimerProps) {
  return <p className={compact ? "disclaimer compact" : "disclaimer"}>文学化解读，仅供玩味</p>;
}
