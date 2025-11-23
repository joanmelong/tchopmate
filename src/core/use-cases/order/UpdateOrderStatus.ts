export default class UpdateOrderStatus {
  private repo: any

  constructor(repo: any) {
    this.repo = repo
  }

  async execute(id: string, newStatus: string): Promise<any> {
    const order = await this.repo.findById(id)
    if (!order) throw new Error('Order not found')

    const current = order.statut

    const validTransitions: Record<string, string[]> = {
      'En attente': ['En préparation'],
      'En préparation': ['Prêt'],
      'Prêt': ['Retiré'],
      'Retiré': []
    }

    // Reject invalid transitions
    const allowed = validTransitions[current] || []
    if (!allowed.includes(newStatus)) {
      // If trying to revert to a previous status, throw a 'revert' like error
      const statuses = Object.keys(validTransitions)
      const currentIdx = statuses.indexOf(current)
      const newIdx = statuses.indexOf(newStatus)
      if (newIdx !== -1 && newIdx < currentIdx) {
        throw new Error('Cannot revert to a previous status')
      }

      throw new Error('Invalid status transition')
    }

    const updated = await this.repo.update(id, { statut: newStatus })
    return updated
  }
}
