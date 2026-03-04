import { type DefaultDocumentNodeResolver } from 'sanity/structure'
import { SanityDocument } from '@sanity/client'
import { ifDocumentExists } from '@sanity/preview-kit'

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  return S.document().views([
    S.view.form(),
    ifDocumentExists((documentId) => S.view.component(() => import('./preview')).options({
      documentId,
    })),
  ])
}