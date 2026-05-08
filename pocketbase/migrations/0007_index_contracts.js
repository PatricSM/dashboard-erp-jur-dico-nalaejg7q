migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')

    const newIndexes = []
    for (let i = 0; i < (col.indexes || []).length; i++) {
      const idx = col.indexes[i]
      if (idx.includes('(`status`)') || idx.includes('(`vigencia_fim`)')) {
        continue
      }
      newIndexes.push(idx)
    }
    col.indexes = newIndexes

    col.addIndex('idx_contracts_status_search', false, 'status', '')
    col.addIndex('idx_contracts_vigencia_fim_search', false, 'vigencia_fim', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
    col.removeIndex('idx_contracts_status_search')
    col.removeIndex('idx_contracts_vigencia_fim_search')
    app.save(col)
  },
)
