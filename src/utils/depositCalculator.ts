export function calculateTotalFromRange(maxNumber: number): number {
  // Soma de todos os números de 1 até maxNumber
  return (maxNumber * (maxNumber + 1)) / 2;
}

export function calculateNumbersFromTotal(targetAmount: number): number {
  // Usando a fórmula inversa da soma de progressão aritmética
  // S = n(n+1)/2, onde S é o valor total desejado
  // Resolvendo para n: n = sqrt(2S)
  const n = Math.ceil(Math.sqrt(2 * targetAmount));
  return n;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function roundToNearest(value: number, step: number = 100): number {
  return Math.ceil(value / step) * step;
}