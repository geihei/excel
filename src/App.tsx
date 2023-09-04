import './App.css';
import "@glideapps/glide-data-grid/dist/index.css";
import { DataEditor, useCustomCells, DataEditorProps, Item, GridMouseEventArgs } from '@glideapps/glide-data-grid'
import React, { useEffect } from 'react';
import SingleSelect from './components/SingleSelect';
import MultiSelect from './components/MultiSelect';
import AntdSelect from './components/AntdSelect';
import { useDataGenerator } from './hooks/useDataGenerator';
// import { useEventListener } from './hooks/useEventListener';
import type { IBounds } from "react-laag";
import { useLayer } from "react-laag";

const cells = [
  SingleSelect,
  MultiSelect,
  AntdSelect,
];

const defaultProps: Partial<DataEditorProps> = {
  smoothScrollX: true,
  smoothScrollY: true,
  width: "100%",
};
const zeroBounds = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
};

function App() {
  // const data = [{
  //   name: '文本1',
  //   single: '单选1',
  //   multi: '多选1,多选2',
  // }, {
  //   name: '文本2',
  //   single: '单选2',
  //   multi: '多选2',
  // }, {
  //   name: '文本3',
  //   single: '单选3',
  //   multi: '多选3',
  // }, {
  //   name: '文本4',
  //   single: '单选4',
  //   multi: '多选4',
  // }, {
  //   name: '文本5',
  //   single: '单选5',
  //   multi: '多选5',
  // }];

  // render自定义cell
  const cellProps = useCustomCells(cells);


  const { cols, getCellContent, onColumnResize, setCellValue } = useDataGenerator(10, false);

  useEffect(() => {
    console.log(cols, '====cols')
  }, [cols]);

  const [tooltip, setTooltip] = React.useState<{ val: string; bounds: IBounds } | undefined>();

  const timeoutRef = React.useRef(0);
  const isOpen = tooltip !== undefined;
  const { renderLayer, layerProps } = useLayer({
      isOpen,
      triggerOffset: 4,
      auto: true,
      container: "portal",
      trigger: {
          getBounds: () => tooltip?.bounds ?? zeroBounds,
      },
  });

  const onItemHovered = React.useCallback((args: GridMouseEventArgs) => {
    if (args.kind === "cell" && getCellContent([args.location[0], args.location[1]])?.kind === 'custom') {
      // @ts-ignore
      // if (getCellContent([args.location[0], args.location[1]])?.data?.kind === 'multi-select') {

      //   window.clearTimeout(timeoutRef.current);
      //   setTooltip(undefined);
      //   // console.log(args, '====args')
      //   console.log(getCellContent([args.location[0], args.location[1]]), '====args')
      //   timeoutRef.current = window.setTimeout(() => {
      //       setTooltip({
      //         // @ts-ignore
      //           val: getCellContent([args.location[0], args.location[1]])?.data?.value?.map(item => item.value)?.join(','),
      //           bounds: {
      //               // translate to react-laag types
      //               left: args.bounds.x,
      //               top: args.bounds.y,
      //               width: args.bounds.width,
      //               height: args.bounds.height,
      //               right: args.bounds.x + args.bounds.width,
      //               bottom: args.bounds.y + args.bounds.height,
      //           },
      //       });
      //   }, 1000);
      // } else {
        window.clearTimeout(timeoutRef.current);
        setTooltip(undefined);
        // console.log(args, '====args')
        console.log(getCellContent([args.location[0], args.location[1]]), '====args')
        timeoutRef.current = window.setTimeout(() => {
            setTooltip({
              // @ts-ignore
                val: getCellContent([args.location[0], args.location[1]])?.data?.value || getCellContent([args.location[0], args.location[1]])?.data,
                bounds: {
                    // translate to react-laag types
                    left: args.bounds.x,
                    top: args.bounds.y,
                    width: args.bounds.width,
                    height: args.bounds.height,
                    right: args.bounds.x + args.bounds.width,
                    bottom: args.bounds.y + args.bounds.height,
                },
            });
        }, 1000);
      // }
    } else {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = 0;
        setTooltip(undefined);
    }
}, []);

  // const keybindings = React.useMemo(() => {
  //   return keybindingsIn === undefined
  //       ? keybindingDefaults
  //       : {
  //             ...keybindingDefaults,
  //             ...keybindingsIn,
  //         };
  // }, [keybindingsIn]);

  // const onCopy = React.useCallback(
  //   async (e?: ClipboardEvent, ignoreFocus?: boolean) => {
  //       if (!keybindings.copy) return;
  //       const focused =
  //           ignoreFocus === true ||
  //           scrollRef.current?.contains(document.activeElement) === true ||
  //           canvasRef.current?.contains(document.activeElement) === true;

  //       const selectedColumns = gridSelection.columns;
  //       const selectedRows = gridSelection.rows;

  //       const copyToClipboardWithHeaders = (
  //           cells: readonly (readonly GridCell[])[],
  //           columnIndexes: readonly number[]
  //       ) => {
  //           if (!copyHeaders) {
  //               copyToClipboard(cells, columnIndexes, e);
  //           } else {
  //               const headers = columnIndexes.map(index => ({
  //                   kind: GridCellKind.Text,
  //                   data: columnsIn[index].title,
  //                   displayData: columnsIn[index].title,
  //                   allowOverlay: false,
  //               })) as GridCell[];
  //               copyToClipboard([headers, ...cells], columnIndexes, e);
  //           }
  //       };

  //       if (focused && getCellsForSelection !== undefined) {
  //           if (gridSelection.current !== undefined) {
  //               let thunk = getCellsForSelection(gridSelection.current.range, abortControllerRef.current.signal);
  //               if (typeof thunk !== "object") {
  //                   thunk = await thunk();
  //               }
  //               copyToClipboardWithHeaders(
  //                   thunk,
  //                   range(
  //                       gridSelection.current.range.x - rowMarkerOffset,
  //                       gridSelection.current.range.x + gridSelection.current.range.width - rowMarkerOffset
  //                   )
  //               );
  //           } else if (selectedRows !== undefined && selectedRows.length > 0) {
  //               const toCopy = [...selectedRows];
  //               const cells = toCopy.map(rowIndex => {
  //                   const thunk = getCellsForSelection(
  //                       {
  //                           x: rowMarkerOffset,
  //                           y: rowIndex,
  //                           width: columnsIn.length - rowMarkerOffset,
  //                           height: 1,
  //                       },
  //                       abortControllerRef.current.signal
  //                   );
  //                   if (typeof thunk === "object") {
  //                       return thunk[0];
  //                   }
  //                   return thunk().then(v => v[0]);
  //               });
  //               if (cells.some(x => x instanceof Promise)) {
  //                   const settled = await Promise.all(cells);
  //                   copyToClipboardWithHeaders(settled, range(columnsIn.length));
  //               } else {
  //                   copyToClipboardWithHeaders(cells as (readonly GridCell[])[], range(columnsIn.length));
  //               }
  //           } else if (selectedColumns.length > 0) {
  //               const results: (readonly (readonly GridCell[])[])[] = [];
  //               const cols: number[] = [];
  //               for (const col of selectedColumns) {
  //                   let thunk = getCellsForSelection(
  //                       {
  //                           x: col,
  //                           y: 0,
  //                           width: 1,
  //                           height: rows,
  //                       },
  //                       abortControllerRef.current.signal
  //                   );
  //                   if (typeof thunk !== "object") {
  //                       thunk = await thunk();
  //                   }
  //                   results.push(thunk);
  //                   cols.push(col - rowMarkerOffset);
  //               }
  //               if (results.length === 1) {
  //                   copyToClipboardWithHeaders(results[0], cols);
  //               } else {
  //                   // FIXME: this is dumb
  //                   const toCopy = results.reduce((pv, cv) => pv.map((row, index) => [...row, ...cv[index]]));
  //                   copyToClipboardWithHeaders(toCopy, cols);
  //               }
  //           }
  //       }
  //   },
  //   [columnsIn, getCellsForSelection, gridSelection, keybindings.copy, rowMarkerOffset, rows, copyHeaders]
  // );

  // useEventListener("copy", onCopy, window, false, false);

  return (
    <>
      {/* @ts-ignore */}
      <DataEditor
        width={500}
        height={1000}
        {...defaultProps}
        {...cellProps}
        rowMarkers="both"
        // verticalBorder={() => true}
        isDraggable={true}
        onColumnResize={onColumnResize}
        getCellContent={getCellContent}
        columns={cols}
        rows={40}
        onCellEdited={setCellValue}
        freezeColumns={1} // 前n列冻结 index从1开始
        getCellsForSelection={true}
        // copyHeaders
        onPaste={(target: Item, values: readonly (readonly string[])[]) => {
          // @ts-ignore
          if (getCellContent([target?.[0], target?.[1]])?.data?.kind === 'multi-select') {
            // 多选粘贴逻辑
            console.log(target, '===target');
            console.log(values, '===values');
            //@ts-ignore
            const str = values?.[0]?.[0]?.replaceAll('"', '');
            return true;
          }
          return true;
        }}
        onItemHovered={onItemHovered}
        // selection={{
        //     current: {
        //         cell: [1, 1],
        //         range: { x: 2, y: 2, width: 1, height: 1 },
        //         rangeStack: [],
        //     },
        //     columns: CompactSelection.empty(),
        //     rows: CompactSelection.empty(),
        // }}
        // trailingRowType={"none"}
        // isResizing={true}
        // isDragging={true}
        // firstColAccessible={true}
        // onCanvasBlur={() => {
        //   console.log(2222)
        // }}
      />
      {isOpen &&
          renderLayer(
              <div
                  {...layerProps}
                  style={{
                      ...layerProps.style,
                      padding: "8px 12px",
                      color: "white",
                      font: "500 13px Inter",
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      borderRadius: 9,
                  }}>
                  {tooltip.val?.toString()}
              </div>
          )}
      {/* 编辑需要的div */}
      
    </>
  );
}

export default App;
