export function ReportsSection() {
  return (
    <section
      id="reports"
      aria-labelledby="reports-title"
      className="mt-20 scroll-mt-28"
    >
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
            REPORTS / 经验与复盘
          </p>
          <h2
            id="reports-title"
            className="text-3xl font-bold text-zinc-900 dark:text-zinc-100"
          >
            汇报
          </h2>
        </div>
        <span className="text-sm text-zinc-500">
          把实践讲清楚，把经验留下来。
        </span>
      </div>
      <a
        href="/reports/half-year-sharing.html"
        className="group grid overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[1.05fr_1fr]"
      >
        <div className="relative flex min-h-[290px] flex-col justify-between overflow-hidden bg-[#142c2c] p-8 text-white sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-72 w-72 rounded-full border-[40px] border-[#c5d88a]/10"
          />
          <div className="relative flex items-center justify-between text-xs tracking-[0.15em] text-[#d4dfa9]">
            <span>HALF-YEAR REVIEW</span>
            <span>11 页 · 动态演示</span>
          </div>
          <div className="relative my-8">
            <span className="mb-5 block h-1 w-10 bg-[#e4cb77]" />
            <p className="text-3xl font-semibold leading-snug sm:text-4xl">
              从接手挑战
              <br />
              到沉淀方法。
            </p>
          </div>
          <div className="relative flex gap-3 text-xs text-white/70">
            <span>CNY → THB</span>
            <span className="text-white/30">/</span>
            <span>跨境薪资 · 业务成长</span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="mb-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            半年度复盘 · 泰哈主线版
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            半年度会议分享
          </h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            从跨境薪资核算的规则差异出发，记录接手过程中的挑战、沟通与改善，让一次实践沉淀为可复用的方法。
          </p>
          <div className="my-6 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            {['业务复盘', '方法沉淀', '成长计划'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-sm dark:border-zinc-800">
            <span className="text-zinc-500">汇报人 · 范旸昳</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              观看汇报{' '}
              <span className="inline-block transition group-hover:translate-x-1">
                ↗
              </span>
            </span>
          </div>
        </div>
      </a>
      <a
        href="/reports/understanding-lean.html"
        className="group mt-6 grid overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[1.05fr_1fr]"
      >
        <div className="relative flex min-h-[290px] flex-col justify-between overflow-hidden bg-[#142c2c] p-8 text-white sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-72 w-72 rounded-full border-[40px] border-[#c5d88a]/10"
          />
          <div className="relative flex items-center justify-between text-xs tracking-[0.15em] text-[#d4dfa9]">
            <span>LEAN THINKING</span>
            <span>23 页 · 动态演示</span>
          </div>
          <div className="relative my-8">
            <span className="mb-5 block h-1 w-10 bg-[#e4cb77]" />
            <p className="text-3xl font-semibold leading-snug sm:text-4xl">
              从认识精益
              <br />
              到持续改善。
            </p>
          </div>
          <div className="relative flex gap-3 text-xs text-white/70">
            <span>WHAT IS LEAN?</span>
            <span className="text-white/30">/</span>
            <span>消除浪费 · 创造价值</span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="mb-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            精益创新 · 年度战略汇报
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            认识精益
          </h3>
          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            从认识精益出发，理解消除浪费与创造价值的核心理念，通过现场案例与改善方法，将精益思维融入日常工作。
          </p>
          <div className="my-6 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            {['精益思维', '消除浪费', '持续改善'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 text-sm dark:border-zinc-800">
            <span className="text-zinc-500">汇报人 · 陈云</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              观看汇报{' '}
              <span className="inline-block transition group-hover:translate-x-1">
                ↗
              </span>
            </span>
          </div>
        </div>
      </a>
    </section>
  )
}
