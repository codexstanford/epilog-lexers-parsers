import type { DatasetToken } from "./dataset-lexer";

/*
Spec:

Parser objects should store all the same data as lexer tokens, but objects can 
have children, which are stored as an ordered list of parser objects. Each object 
can have 0 or more children. If an object doesn't have children, it is a token 
from the lexer and its data should be the same as what was returned by the lexer. 
If an object has children, the start of its extent is the min(child[i].start) 
among its children, and the end of its extent is the max(child[i].end) among its 
children. Additional details on parser objects are listed below - for each object, 
the children it can/must have are listed below it in the order in which they must 
occur.

Error tokens can appear at any point in a parse tree. Most commonly, I expect they 
will occur as the last child of a parser object. If that is the only place they 
occur, that will be acceptable minimum functionality.
*/

export type DatasetParserObject =
  | DatasetToken
  | (DatasetToken & {
      children: DatasetParserObject[];
    });

export function datasetParser(
  tokens: DatasetToken[]
): DatasetParserObject | "error" {
  throw new Error("Not implemented");
}
