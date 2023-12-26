/* eslint-disable react/jsx-no-undef */
import {
  ChevronUpDownIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  IconButton,
  Input,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import { Search } from "react-feather";

import image from '@/assets/territory_green_1.jpg';

const TABS = [
  {
    label: "Todos",
    value: "all",
  },
  {
    label: "Quadra 1",
    value: "monitored",
  },
  {
    label: "Quadra 2",
    value: "unmonitored",
  },
];

const TABLE_HEAD = ["Nome da Rua", "Nº da casa", "Complemento", "Não Bater", "Editar", "Excluir"];

const TABLE_ROWS = [
  {
    street: "Rua 1",
    numberHouse: "1",
    notHit: true,
    legend: "L1",
  },
  {
    street: "Rua 2",
    numberHouse: "2",
    notHit: false,
    legend: "L2",
  },
  {
    street: "Rua 3",
    numberHouse: "3",
    notHit: true,
    legend: "L3",
  },
  {
    street: "Rua 4",
    numberHouse: "4",
    notHit: false,
    legend: "L4",
  },
  {
    street: "Rua 5",
    numberHouse: "5",
    notHit: true,
    legend: "L5",
  },
  {
    street: "Rua 6",
    numberHouse: "6",
    notHit: false,
    legend: "L6",
  },
  {
    street: "Rua 7",
    numberHouse: "7",
    notHit: true,
    legend: "L7",
  },
  {
    street: "Rua 8",
    numberHouse: "8",
    notHit: false,
    legend: "L8",
  },
  {
    street: "Rua 9",
    numberHouse: "9",
    notHit: true,
    legend: "L9",
  },
  {
    street: "Rua 10",
    numberHouse: "10",
    notHit: false,
    legend: "L10",
  }
];

interface IHeaderHomeProps {
  search: string;
  handleChangeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SortableTable({
  search,
  handleChangeSearch,
}: IHeaderHomeProps) {
  return (
    // container
    <div className='p-8'>

      {/* titulo + image */}
      <div className='flex items-center gap-4 py-2'>
        <div className='w-[50px] overflow-hidden rounded-full '>
          <Image src={image} alt='logo' className='w-full' />
        </div>
        <Typography
          variant="h3"
          className="flex items-center justify-between gap-2 font-normal leading-none p-2"
        >
          01 - Jd Magnolias
        </Typography>
      </div>

      {/* search */}
      <div className="w-[400px] laptop:w-[600px] mini:w-60 py-2">
        <Input
          id="admin-filter-search"
          label='Pesquise o território'
          className='shadow-md w-full'
          value={search}
          onChange={handleChangeSearch}
          icon={<Search size={16} />}
          autoFocus
        />
      </div>

      {/* Filtros */}
      <div className='py-2'>
        <Button variant="filled" className="bg-primary flex items-center gap-2" size="sm">
          <Typography variant="small" color="white">
            Novo
          </Typography>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabela */}
      <Card className="h-full w-full py-2">

        <CardBody className="overflow-scroll p-0">
          <table className=" w-full table-auto text-left">

            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => {

                  return (
                    <th
                      key={head}
                      className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-3 transition-colors hover:bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                      >
                        {head}{" "}
                        {index !== TABLE_HEAD.length - 1 && (
                          <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                        )}
                      </Typography>
                    </th>

                  )
                })}
              </tr>
            </thead>

            <tbody>
              {TABLE_ROWS.map(
                ({ street, numberHouse, notHit, legend }, index) => {
                  const isLast = index === TABLE_ROWS.length - 1;
                  const classes = isLast
                    ? "p-3"
                    : "p-3 border-b border-blue-gray-50";
                  // fazer uma linha cinza claro e outra branco

                  const linha = index % 2 === 0 ? "bg-white" : "bg-gray-100";

                  return (
                    <tr key={street} className={linha}>

                      {/* Nome da Rua */}
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {street}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      {/* Numero da casa */}
                      <td className={classes}>
                        <div className="flex flex-col justify-center">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {numberHouse}
                          </Typography>
                        </div>
                      </td>

                      {/* Complemento */}
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {legend}
                        </Typography>
                      </td>

                      {/* Nao Bater */}
                      <td className={classes}>
                        <div className="w-max text-center">
                          {!notHit && (
                            <Chip
                              variant="ghost"
                              size="sm"
                              value="SIM"
                              color="red"
                            />
                          )}
                        </div>
                      </td>

                      {/* Editar */}
                      <td className={classes}>
                        <Tooltip content="Edit User">
                          <IconButton variant="text">
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                      {/* Excluir */}
                      <td className={classes}>
                        <Tooltip content="Delete User">
                          <IconButton variant="text">
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>

                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </CardBody>

        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page 1 of 10
          </Typography>
          <div className="flex gap-2">
            <Button variant="outlined" size="sm">
              Previous
            </Button>
            <Button variant="outlined" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

    </div>

  );
}