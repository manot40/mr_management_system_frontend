import { Input, Select, Button } from "components";
import { useCallback, useState } from "react";
import { useWindowSize } from "libs/hooks/useWindowSize";
import { Dashboard } from "layout";
import { NextPage } from "next";
import clsx from "clsx";

const options = [
  { id: "1", value: "Barang 1", unit: "PCS" },
  { id: "2", value: "Barang 2", unit: "KG" },
  { id: "3", value: "Barang 3", unit: "MTR" },
  { id: "4", value: "Barang 4", unit: "GLN" },
  { id: "5", value: "Barang 5", unit: "BTL" },
  { id: "6", value: "Barang 6", unit: "PCS" },
  { id: "7", value: "Barang 7", unit: "BTL" },
  { id: "8", value: "Barang 8", unit: "LTR" },
  { id: "9", value: "Barang 9", unit: "KG" },
  { id: "10", value: "Barang 10", unit: "PCS" },
];

const NewTransaction: NextPage = () => {
  const { width } = useWindowSize();
  const [tableData, setTableData] = useState([{ item: "", quantity: 1 }]);
  const [warehouse, setWarehouse] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

  const itemChanged = useCallback<(val: string, idx: number) => void>(
    (val, idx) => {
      if (val) {
        const newData = [...tableData];
        newData[idx] = { item: val, quantity: newData[idx].quantity };
        setTableData(newData);
      }
    },
    [tableData]
  );

  const deleteRow = useCallback(
    (idx) => {
      const newData = [...tableData];
      newData.splice(idx, 1);
      setTableData(newData);
    },
    [tableData]
  );

  const addRow = useCallback(() => {
    const newData = [...tableData];
    newData.push({ item: "", quantity: 1 });
    setTableData(newData);
  }, [tableData]);

  const onQuantityChanged = useCallback(
    (val, idx) => {
      const newData = [...tableData];
      newData[idx].quantity = val;
      setTableData(newData);
    },
    [tableData]
  );

  return (
    <Dashboard Title="Transaksi Baru" className="py-8">
      <div className="block md:flex mb-8">
        <div
          className={clsx(
            "flex space-x-2 max-w-max mb-4 md:mb-0 md:mr-2",
            width < 768 && "overflow-x-auto"
          )}
        >
          <Input
            value={date}
            label="Tanggal Transaksi"
            type="date"
            placeholder="Pilih Tanggal"
            className="w-40"
            onChange={(val) => setDate(val)}
          />
          <Select
            value={type}
            labelHtml="Transaksi"
            placeholder="Pilih Transaksi"
            className="w-36"
            required
            options={[
              { id: "out", label: "Keluar" },
              { id: "in", label: "Masuk" },
            ]}
            onChange={(val) => setType(val as string)}
          />
          <Select
            value={warehouse}
            labelHtml="Gudang"
            placeholder="Pilih Gudang"
            className="w-44"
            required
            options={[
              { id: "1", "label": "Gudang SOS" },
              { id: "2", "label": "Gudang Virtus" },
            ]}
            onChange={(val) => setWarehouse(val as string)}
          />
        </div>
        <Input
          value={desc}
          label="Keterangan"
          placeholder="Input Keterangan"
          className="w-full md:w-64"
          onChange={(val) => setDesc(val)}
        />
      </div>
      <div>
        <div className="sticky flex justify-between text-2xl font-semibold mb-4">
          <h1>Daftar Barang</h1>
          <Button onClick={addRow}>Tambah Baris</Button>
        </div>
        <div className={clsx(width < 768 && "overflow-x-auto")}>
          <table className="table-parent" style={{borderSpacing: 0}}>
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th>Jumlah</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, idx) => (
                <tr key={idx}>
                  <td className="w-56 md:w-1/2">
                    <Select
                      searchable
                      placeholder="Input Nama Barang"
                      className="w-56 md:w-auto"
                      value={data.item}
                      labelKey="value"
                      options={options}
                      onChange={(val) => itemChanged(val as string, idx)}
                    />
                  </td>
                  <td>
                    <p>{options.find(val => val.id === data.item)?.unit || "-"}</p>
                  </td>
                  <td>
                    <Input
                      label=""
                      type="number"
                      placeholder="Jumlah Barang"
                      parentClass="w-24 md:w-auto"
                      value={data.quantity}
                      onChange={(val) => onQuantityChanged(val, idx)}
                    />
                  </td>
                  <td>
                    <Button
                      tabIndex={-1}
                      onClick={() => deleteRow(idx)}
                      className={clsx(
                        "danger",
                        tableData.length === 1 && "hidden"
                      )}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th>Jumlah</th>
                <th>Action</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex justify-end my-8 space-x-2">
          <Button
            className="info w-full md:w-1/4"
            onClick={() => alert(JSON.stringify(tableData))}
          >
            Submit
          </Button>
          <Button className="min-w-fit" onClick={addRow}>
            Tambah Baris
          </Button>
        </div>
      </div>
    </Dashboard>
  );
};

export default NewTransaction;
