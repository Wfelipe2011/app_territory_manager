import { Button, Card, Input, Option, Select, Typography } from "@material-tailwind/react";
import { useState } from "react";

const legendas = [
  { name: "Fundo" },
  { name: "Terreno" },
  { name: "Comércio" },
  { name: "Testemunha de Jeová" },
  { name: "Igreja" },
  { name: "Hospital" },
  { name: "Escola" },
  { name: "Residência" },
  { name: "Prédio" },
]

const dontVisitList = ["SIM", "NÃO"]
// form {
//   street: '',
//   number: '',
//   legend: '',
//   dontVisit: '',
//   block: '',
// }

export function SimpleRegistrationForm({ blockOptions, form }) {
  const [blockSelected, setBlockSelected] = useState(blockOptions.find(b => b.name === form.block)?.name)
  const [legendSelected, setLegendSelected] = useState(form.legend)
  const [dontVisitSelected, setDontVisitSelected] = useState(form.dontVisit ? "SIM" : "NÃO")

  const changeBlock = (value) => {
    setBlockSelected(value)
  }
  const changeLegend = (value) => {
    setLegendSelected(value)
  }
  const changeDontVisit = (value) => {
    setDontVisitSelected(value)
  }

  return (
    <Card color="transparent" shadow={false} className="w-full">
      {/* adicionar botão de fechar */}
      <form className="w-full flex flex-col items-end">
        <div className="p-2 mb-1 flex w-full flex-col gap-6">
          {/* Linha 1 */}

          <div className="flex gap-2">
            <div className="mb-1 flex flex-col gap-6 w-2/3 pr-4">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Rua
              </Typography>
              <Input
                size="lg"
                placeholder="João Pessoa"
                value={form.street}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900 w-full"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                N° Casa
              </Typography>
              <Input
                size="lg"
                placeholder="50"
                value={form.number}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

          </div>
          {/* Linha 2 */}
          <div className="flex gap-6 w-full">

            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Legenda
              </Typography>
              <Select
                size="lg"
                onChange={changeLegend}
                value={legendSelected}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}

              >
                {legendas?.map((b, index) => (
                  // eslint-disable-next-line react/jsx-no-undef
                  <Option key={b.name} value={String(b.name)}>
                    {b.name}
                  </Option>
                ))}
              </Select >
            </div>


            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Não Bater
              </Typography>
              <Select
                size="lg"
                onChange={changeDontVisit}
                value={dontVisitSelected}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}

              >
                {dontVisitList?.map((b, index) => (
                  // eslint-disable-next-line react/jsx-no-undef
                  <Option key={b} value={String(b)}>
                    {b}
                  </Option>
                ))}
              </Select >
            </div>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Quadra
              </Typography>
              <Select
                size="lg"
                onChange={changeBlock}
                value={blockSelected}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}

              >
                {blockOptions?.map((b, index) => (
                  // eslint-disable-next-line react/jsx-no-undef
                  <Option key={b.id} value={String(b.name)}>
                    {b.name}
                  </Option>
                ))}
              </Select >
            </div>



          </div>

        </div>

        <Button className="m-4 mt-6 w-32 bg-primary" >
          Atualizar
        </Button>

      </form>
    </Card>
  );
}