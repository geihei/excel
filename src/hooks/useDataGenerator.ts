import React from "react";
import {
  GridColumn,
  GridCellKind,
  Item,
  EditableGridCell,
  GridCell,
  isEditableGridCell,
  isTextEditableGridCell,
} from "@glideapps/glide-data-grid";
import { isArray } from "lodash";
// import { SingleSelectCell } from "../components/SingleSelect";
// import { MultiSelectCell } from "../components/MultiSelect";

type GridColumnInfo = GridColumn & {
  getContent(): GridCell;
};

// type ComposeEditableGridCell =
//   | EditableGridCell
//   | SingleSelectCell
//   | MultiSelectCell;

function isTruthy(x: any): boolean {
  return x ? true : false;
}

function lossyCopyData<T extends EditableGridCell>(
  source: EditableGridCell,
  target: T
): EditableGridCell {
  const sourceData = source.data;

  console.log(sourceData);
  console.log(target);
  console.log(
    typeof sourceData === typeof target.data,
    "===typeof sourceData === typeof target.data"
  );

  if (typeof sourceData === typeof target.data) {
    return {
      ...target,
      data: sourceData as any,
    };
  } else
    switch (target.kind) {
      case GridCellKind.Uri: {
        if (isArray(sourceData)) {
          return {
            ...target,
            data: sourceData[0],
          };
        }
        return {
          ...target,
          data: sourceData?.toString() ?? "",
        };
      }
      case GridCellKind.Boolean: {
        if (isArray(sourceData)) {
          return {
            ...target,
            data: sourceData[0] !== undefined,
          };
        } else if (source.kind === GridCellKind.Boolean) {
          return {
            ...target,
            data: source.data,
          };
        }
        return {
          ...target,
          data: isTruthy(sourceData) ? true : false,
        };
      }
      case GridCellKind.Image: {
        if (isArray(sourceData)) {
          return {
            ...target,
            data: [sourceData[0]],
          };
        }
        return {
          ...target,
          data: [sourceData?.toString() ?? ""],
        };
      }
      case GridCellKind.Number: {
        return {
          ...target,
          data: 0,
        };
      }
      case GridCellKind.Text:
      case GridCellKind.Markdown: {
        if (isArray(sourceData)) {
          return {
            ...target,
            data: sourceData[0].toString() ?? "",
          };
        }

        return {
          ...target,
          data: source.data?.toString() ?? "",
        };
      }
      case GridCellKind.Custom: {
        console.log(source.data, "====sourceData");
        return target;
      }
    }
}

function getGridColumn(column: GridColumnInfo): GridColumn {
  const { getContent, ...rest } = column;

  return rest;
}

class ContentCache {
  private cachedContent: Map<number, Map<number, GridCell>> = new Map();

  get(col: number, row: number) {
    const colCache = this.cachedContent.get(col);

    if (colCache === undefined) {
      return undefined;
    }

    return colCache.get(row);
  }

  set(col: number, row: number, value: GridCell) {
    if (this.cachedContent.get(col) === undefined) {
      this.cachedContent.set(col, new Map());
    }

    const rowCache = this.cachedContent.get(col) as Map<number, GridCell>;
    rowCache.set(row, value);
  }
}

function getResizableColumns(amount: number): GridColumnInfo[] {
  const columns: GridColumnInfo[] = [
    {
      title: "文本",
      id: "文本",
      getContent: () => {
        return {
          kind: GridCellKind.Text,
          readonly: false,
          allowOverlay: true,
          displayData: "文本1",
          data: "文本1",
        };
      },
    },
    {
      title: "单选",
      id: "单选",
      getContent: () => {
        return {
          kind: GridCellKind.Custom,
          readonly: false,
          allowOverlay: true,
          copyData: "单选1",
          data: {
            kind: "single-select",
            allowedValues: [
              "单选1单选1单选1",
              "单选2",
              "单选3",
              "单选4",
              "单选5",
            ],
            value: "单选1单选1单选1",
          },
        };
      },
    },
    {
      title: "多选",
      id: "多选",
      getContent: () => {
        return {
          kind: GridCellKind.Custom,
          readonly: false,
          allowOverlay: true,
          copyData: `多选1多选1多选1多选1,多选2`,
          data: {
            kind: "multi-select",
            allowedValues: [
              "多选1多选1多选1多选1",
              "多选2",
              "多选3",
              "多选4",
              "多选5",
            ],
            value: "多选1多选1多选1多选1,多选2",
          },
        };
      },
    },
    {
      title: "antd多选",
      id: "多选",
      getContent: () => {
        return {
          kind: GridCellKind.Custom,
          readonly: false,
          allowOverlay: true,
          displayData: "多选1",
          copyData: "多选1",
          data: {
            kind: "antd-select",
            allowedValues: ["多选1", "多选2", "多选3", "多选4", "多选5"],
            value: "多选1",
          },
        };
      },
    },
  ];
  if (amount < columns.length) {
    return columns.slice(0, amount);
  }

  return [...columns];
}

export function useDataGenerator(
  numCols: number,
  readonly: boolean = true,
  group: boolean = false
) {
  const cache = React.useRef<ContentCache>(new ContentCache());

  const [colsMap, setColsMap] = React.useState(() =>
    getResizableColumns(numCols)
  );

  React.useEffect(() => {
    setColsMap(getResizableColumns(numCols));
  }, [group, numCols]);

  const onColumnResize = React.useCallback(
    (column: GridColumn, newSize: number) => {
      setColsMap((prevColsMap) => {
        const index = prevColsMap.findIndex((ci) => ci.title === column.title);
        const newArray = [...prevColsMap];
        newArray.splice(index, 1, {
          ...prevColsMap[index],
          width: newSize,
        });
        return newArray;
      });
    },
    []
  );

  const cols = React.useMemo(() => {
    return colsMap.map(getGridColumn);
  }, [colsMap]);

  const colsMapRef = React.useRef(colsMap);
  colsMapRef.current = colsMap;
  const getCellContent = React.useCallback(
    ([col, row]: Item): GridCell => {
      let val = cache.current.get(col, row);
      if (val === undefined) {
        val = colsMapRef.current[col]?.getContent();
        if (!readonly && val && isTextEditableGridCell(val)) {
          val = { ...val, readonly };
        }
        cache.current.set(col, row, val);
      }
      return val;
    },
    [readonly]
  );

  const setCellValueRaw = React.useCallback(
    ([col, row]: Item, val: GridCell): void => {
      cache.current.set(col, row, val);
    },
    []
  );

  const setCellValue = React.useCallback(
    ([col, row]: Item, val: GridCell): void => {
      let current = cache.current.get(col, row);
      if (current === undefined) {
        current = colsMap[col].getContent();
      }
      if (isEditableGridCell(val) && isEditableGridCell(current)) {
        console.log(val, "===val");
        console.log(current, "===current");
        const copied = lossyCopyData(val, current);

        console.log(copied, "===copied");
        cache.current.set(col, row, {
          ...copied,
          displayData:
            typeof copied.data === "string"
              ? copied.data
              : (copied as any).displayData,
          lastUpdated: performance.now(),
          // @ts-ignore
          copyData: copied.data?.value,
        } as any);
      }
    },
    [colsMap]
  );

  return {
    cols,
    getCellContent,
    onColumnResize,
    setCellValue,
    setCellValueRaw,
  };
}
