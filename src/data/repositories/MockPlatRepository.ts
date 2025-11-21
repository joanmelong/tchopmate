/**
 * Mock simple pour les tests
 * À remplacer par une vraie implémentation
 */

interface MockPlat {
  id: number;
  nom: string;
  prix: number;
  isAvailable: () => boolean;
}

export class MockPlatRepository {
  private plats = new Map<number, MockPlat>([
    [1, { id: 1, nom: 'Ndolé aux crevettes', prix: 2500, isAvailable: () => true }],
    [2, { id: 2, nom: 'Riz sauté aux légumes', prix: 1800, isAvailable: () => true }],
    [3, { id: 3, nom: 'Jus de bissap', prix: 500, isAvailable: () => true }],
    [4, { id: 4, nom: 'Poulet DG', prix: 3000, isAvailable: () => true }],
    [5, { id: 5, nom: 'Plantain frit', prix: 800, isAvailable: () => true }],
  ]);

  async getById(id: number): Promise<MockPlat | null> {
    const plat = this.plats.get(id);
    return plat || null;
  }
}