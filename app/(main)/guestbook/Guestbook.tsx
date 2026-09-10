'use client'

import { type GuestbookDto } from '~/db/dto/guestbook.dto'

import { GuestbookFeeds } from './GuestbookFeeds'
import { GuestbookInput } from './GuestbookInput'

export function Guestbook(props: { messages?: GuestbookDto[] }) {
  return (
    <section className="max-w-2xl">
      <GuestbookInput />

      <GuestbookFeeds messages={props.messages} />
    </section>
  )
}
