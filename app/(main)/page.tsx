import React from 'react'

import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
import { Headline } from '~/app/(main)/Headline'
import { PhotoGallery } from '~/app/(main)/PhotoGallery'
import { HomeProjectList } from '~/app/(main)/projects/HomeProjectList'
import { Resume } from '~/app/(main)/Resume'
import { PencilSwooshIcon, PresentationIcon } from '~/assets'
import { Container } from '~/components/ui/Container'
import { getSettings } from '~/sanity/queries'

export default async function BlogHomePage() {
  const settings = await getSettings()
  const projects = settings?.projects || []

  return (
    <>
      <Container className="mt-10">
        <Headline />
      </Container>

      <Container className="mt-16 md:mt-20">
        <PhotoGallery />
      </Container>

      <Container className="mt-20 md:mt-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* 左侧：近期文章 */}
          <div className="flex flex-col gap-4">
            <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <PencilSwooshIcon className="h-5 w-5 flex-none" />
              <span className="ml-2">近期文章</span>
            </h2>
            <BlogPosts />
          </div>

          {/* 右侧：个人履历 + 项目展示 */}
          <div className="flex flex-col gap-4 lg:w-72">
            <Resume />

            <div className="flex flex-col gap-4">
              <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <PresentationIcon className="h-5 w-5 flex-none" />
                <span className="ml-2">项目展示</span>
              </h2>
              <HomeProjectList projects={projects} limit={6} />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}

export const revalidate = 60
