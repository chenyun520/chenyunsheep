import {defineConfig} from 'sanity'
import { DocumentTextIcon, TagIcon, BriefcaseIcon } from '@sanity/icons'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Chenyun Sheep',

  projectId: '06ixdv8f',
  dataset: 'production',

  plugins: [
    structureTool({
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
            S.listItem()
              .title('Projects')
              .icon(BriefcaseIcon)
              .child(S.documentTypeList('project').title('Projects')),
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
