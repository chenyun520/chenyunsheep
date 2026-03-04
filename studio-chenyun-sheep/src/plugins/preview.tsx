import { NextPage } from 'next'
import { SanityDocument } from '@sanity/client'
import { StudioPreview } from '@sanity/vision'
import { defineQuery } from 'groq'
import { client } from '~/sanity/client'

const previewQuery = defineQuery(`*[_type == "post" && _id == $id][0]{slug, mainImage{asset->{url}}}`)

const PostPreview: NextPage<{ documentId: string }> = ({ documentId }) => {
  const { data } = usePreviewSuspenseQuery(
    client,
    previewQuery,
    { id: documentId },
    { perspective: 'previewDrafts' }
  )

  if (!data) return <div>Loading preview...</div>

  return (
    <div>
      <StudioPreview
        document={data as SanityDocument}
        options={{
          preview: {
            url: `/blog/${data.slug.current}`,
          },
        }}
      />
    </div>
  )
}

export default PostPreview