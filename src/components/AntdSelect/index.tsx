import React from 'react';
// import { Select } from 'antd';
import {
  CustomCell,
  ProvideEditorCallback,
  CustomRenderer,
  getMiddleCenterBias,
  GridCellKind,
  // useTheme,
} from "@glideapps/glide-data-grid";
import { Select } from 'antd';

interface DropdownCellProps {
  readonly kind: "antd-select";
  readonly value: string;
  readonly allowedValues: readonly string[];
  readonly readonly?: boolean;
}

export type DropdownCell = CustomCell<DropdownCellProps>;

const Editor: ReturnType<ProvideEditorCallback<DropdownCell>> = p => {
  const { value: cell, onFinishedEditing } = p;
  const { allowedValues, value: valueIn } = cell.data;

  const [value, setValue] = React.useState(valueIn);

  // const [inputValue, setInputValue] = React.useState(initialValue ?? "");

  // const theme = useTheme();

  const values = React.useMemo(
      () =>
          allowedValues.map(x => ({
              value: x,
              label: x,
          })),
      [allowedValues]
  );

  return (
      <Select
        className="glide-select"
        value={values.find(x => x.value === value)}
        getPopupContainer={() => document.getElementById("portal") as any}
        autoFocus={true}
        bordered={false}
        showSearch
        options={values}
        // dropdownRender={() => (
        //   <div onClick={() => console.log(333)}>2222</div>
        // )}
        onBlur={() => { console.log(111) }}
        onSelect={() => {console.log(222)}}
        onChange={async e => {
          console.log(e?.value, '====e')
            if (e === null) return;
            setValue(e?.value);
            await new Promise(r => window.requestAnimationFrame(r));
            onFinishedEditing({
                ...cell,
                data: {
                    ...cell.data,
                    value: e?.value,
                },
            });
        }}
      />
  );
};

const MultiSelect: CustomRenderer<DropdownCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is DropdownCell => (c.data as any).kind === "antd-select",
  draw: (args, cell) => {
      const { ctx, theme, rect } = args;
      const { value } = cell.data;
      ctx.fillStyle = theme.textDark;
      ctx.fillText(
          value,
          rect.x + theme.cellHorizontalPadding,
          rect.y + rect.height / 2 + getMiddleCenterBias(ctx, theme)
      );

      return true;
  },
  provideEditor: () => ({
      editor: Editor,
      disablePadding: true,
      deletedValue: v => ({
          ...v,
          copyData: "",
          data: {
              ...v.data,
              value: "",
          },
      }),
  }),
  onPaste: (v, d) => ({
      ...d,
      value: d.allowedValues.includes(v) ? v : d.value,
  }),
};

export default MultiSelect;
