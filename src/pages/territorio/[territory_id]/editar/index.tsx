import { useState } from "react";

import { SortableTable } from "@/components/Templates/TabelaEdit";

export default function TerritoryEdit() {
  const [search, setSearch] = useState<string>('');

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }
  return (
    <SortableTable
      search={search}
      handleChangeSearch={handleChangeSearch}
    ></SortableTable>
  )
}