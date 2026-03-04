import {defineConfig} from 'sanity'
import {structure} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {postType, categoryType, blockContentType} from './simple-schemas'
import { DocumentTextIcon, TagIcon } from '@sanity/icons'

export default defineConfig({
  name: 'default',
  title: 'Chenyun Sheep',

  projectId: '06ixdv8f',
  dataset: 'production',

  plugins: [
    structure({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Blog Posts')
              .icon(DocumentTextIcon)
              .child(S.documentTypeList('post').title('Articles')),
            S.listItem()
              .title('Categories')
              .icon(TagIcon)
              .child(S.documentTypeList('category').title('Categories')),
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: [postType, categoryType, blockContentType],
  },
})