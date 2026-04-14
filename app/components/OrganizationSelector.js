import { useState } from 'react'

export default function OrganizationSelector({ organizations, currentOrgId, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 mb-1">Organisation</label>
      <select
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={currentOrgId || ''}
        onChange={e => onChange(e.target.value)}
      >
        {organizations.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  )
}
