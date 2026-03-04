import { type StructureResolver } from 'sanity/structure'
import { DocumentTextIcon, TagIcon, CogIcon } from '@sanity/icons'
import { createSingleton } from '~/sanity/plugins/settings'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      createSingleton(S, 'settings', 'Site Settings', CogIcon),
      S.divider(),
      S.listItem()
        .title('Blog Posts')
        .icon(DocumentTextIcon)
        .child(
          S.documentTypeList('post').title('Articles')
        ),
      S.listItem()
        .title('Categories')
        .icon(TagIcon)
        .child(
          S.documentTypeList('category').title('Categories')
        ),
    ])