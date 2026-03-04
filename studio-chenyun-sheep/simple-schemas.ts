import { defineType, defineField } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: '文章',
  type: 'document',
  icon: 'DocumentTextIcon',
  fields: [
    defineField({
      name: 'title',
      title: '标题',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: '链接标识符',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: '分类',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: '发布时间',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: '主图',
      type: 'image',
      description: 'This image will be used for the preview (1200 x 675px)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: '简介',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: '内容',
      type: 'blockContent',
    }),
    defineField({
      name: 'readingTime',
      title: '阅读时长（分钟）',
      type: 'number',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'body',
      },
    }),
    defineField({
      name: 'mood',
      title: '文章情绪',
      type: 'string',
      options: {
        list: [
          { title: 'Neutral', value: 'neutral' },
          { title: 'Happy', value: 'happy' },
          { title: 'Sad', value: 'sad' },
        ],
        layout: 'radio',
      },
    }),
  ],

  initialValue: () => ({
    publishedAt: new Date().toISOString(),
    mood: 'neutral',
    readingTime: 0,
  }),

  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})

export const categoryType = defineType({
  name: 'category',
  title: '分类',
  type: 'document',
  icon: 'TagIcon',
  fields: [
    defineField({
      name: 'title',
      title: '名称',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: '链接标识符',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'description',
      title: '简单介绍',
      type: 'text',
    }),
  ],
})

export const blockContentType = defineType({
  name: 'blockContent',
  type: 'array',
  of: [
    { type: 'block' },
    {
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    },
    {
      type: 'object',
      name: 'code',
      title: 'Code block',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
        },
      ],
    },
  ],
})