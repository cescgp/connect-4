import { GridBoxDto } from "../model/GridDto";

export default class GridUtils {
    public static generateDefaultGrid() : GridBoxDto[][] {
        let gridArray: GridBoxDto[][] = [];
        for(let y = 0; y < 6; y++){
            let columns: GridBoxDto[] = [];
            for(let x = 0; x < 7; x++) {
                columns.push({
                    selected: 'none',
                    column: x,
                    row: y
                });
            }
            gridArray.push([...columns])
        }

        return gridArray;
    }
}