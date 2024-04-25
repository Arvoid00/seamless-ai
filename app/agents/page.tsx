import { DataTable } from '@/components/table/data-table'
import React from 'react'
import { getAgents } from './actions'
import { columns } from './columns'
import AgentDialog from '@/components/agent-dialog'
// import AgentDialog from '@/components/agent-dialog'

async function AgentsPage() {
    const { data: agents, error } = await getAgents()

    if (error) {
        console.error(error)
        return <div>Error loading agents. <pre>{JSON.stringify(error, null, 2)}</pre></div>
    }

    return (
        <div className="flex flex-col min-h-[calc(h-screen-56px)]">
            <header className="flex items-center justify-between h-14 gap-4 border-b lg:h-[60px] bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <h1 className="text-lg font-semibold">Agent Management</h1>
                {/* <DragAndDrop /> */}
                <AgentDialog title={"Create Agent"} action={"add"} />
            </header>
            <main className="flex-1 p-4 md:p-6">
                {error ? <div>Error loading agents. <pre>{JSON.stringify(error, null, 2)}</pre></div> : <DataTable data={agents ?? []} columns={columns} tablePluralName='agents' />}
            </main>
        </div>
    )
}

export default AgentsPage