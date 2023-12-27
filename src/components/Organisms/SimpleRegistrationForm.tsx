import { Button, Card, Input, Typography } from "@material-tailwind/react";

export function SimpleRegistrationForm() {
  return (
    <Card color="transparent" shadow={false} className="w-full">
      {/* adicionar botão de fechar */}
      <form className="m-2 w-full flex flex-col items-end">
        <div className="mb-1 flex flex-col gap-6 w-full">
          {/* Linha 1 */}
          <Typography variant="h6" color="blue-gray" className="-mb-3">
            Rua
          </Typography>
          <Input
            size="lg"
            placeholder="João Pessoa"
            className=" !border-t-blue-gray-200 focus:!border-t-gray-900 w-full"
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />

          {/* Linha 2 */}
          <div className="flex gap-6">
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                CEP
              </Typography>
              <Input
                size="lg"
                placeholder="180044-50"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Quadra
              </Typography>
              <Input
                size="lg"
                placeholder="1"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

          </div>

          {/* Linha 3 */}
          <div className="flex gap-6">
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Case
              </Typography>
              <Input
                size="lg"
                placeholder="50"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Legenda
              </Typography>
              <Input
                size="lg"
                placeholder="Fundo"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Não Bater
              </Typography>
              <Input
                size="lg"
                placeholder="1"
                type="date"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
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