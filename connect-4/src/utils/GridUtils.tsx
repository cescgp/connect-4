import { GridColumnDto, GridRowDto } from "../model/GridDto";

export default class GridUtils {
    public static generateDefaultGrid() : GridRowDto[] {
        let gridArray: GridRowDto[] = [];
        for(let y = 0; y < 6; y++){
            let columns: GridColumnDto[] = [];
            for(let x = 0; x < 7; x++) {
                columns.push({
                    selected: 'none',
                    positionX: x,
                    positionY: y
                });
            }
            gridArray.push({columns: columns})
        }

        return gridArray;
    }
}