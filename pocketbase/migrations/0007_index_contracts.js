migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
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
