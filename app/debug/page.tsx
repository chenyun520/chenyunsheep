import { getSettings } from '~/sanity/queries'

export default async function DebugPage() {
  const settings = await getSettings()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">调试信息</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">项目列表（共 {settings?.projects?.length || 0} 个）</h2>
        <div className="space-y-4">
          {settings?.projects?.map((project, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-bold">{project.name}</h3>
              <p className="text-sm text-gray-600 mt-1">URL: {project.url}</p>
              <p className="text-sm text-gray-600 mt-1">ID: {project._id}</p>
              <p className="text-sm text-gray-600 mt-1">描述: {project.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">📝 说明</h3>
        <p className="text-sm">
          项目数据来自 Sanity CMS 的 Settings 文档。如果项目数量不对，请检查：
        </p>
        <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
          <li>登录 <a href="https://sanity.io/manage" className="text-blue-600 underline">Sanity 管理后台</a></li>
          <li>进入你的项目 → Content</li>
          <li>找到或创建 Settings 文档</li>
          <li>确保 projects 数组中包含所有项目</li>
        </ol>
      </div>
    </div>
  )
}
