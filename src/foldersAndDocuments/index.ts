/***
 * Document properties for eis documents.
 */
interface DocumentsProps {
  documentId: string; //identity
  fileName: string; //short name of file
  creationDate: string; // creation date
  fileSize?: number; // file size(B)
  comment?: string; // comment
  contentType?: string; // file type(http format)
  attachmentTypeCd?: string | undefined | null; //eis file type
  parentFolderName?: string; //parent folder short name
  parentFolderId?: string; //parent folder id
}
/***
 * Document properties for eis documents.
 */
export interface FolderAndDocumentsProps {
  folderId: string; // folder id
  folderName: string; // folder name
  documents: DocumentsProps[]; // documents
  subFolders?: FolderAndDocumentsProps[]; //subFolders
  permission?: string; //permission
  parentFolderId?: string; //parent folder id
  parentFolderName?: string; //parent folder short name
}
export interface FilterFoldersProps {
  /***
   * can be include, exclude, includeRecursive and excludeRecursive or undefined or null, default is include
   * */
  mode?:
    | "include"
    | "exclude"
    | "includeRecursive"
    | "excludeRecursive"
    | undefined
    | null;
  folders: any;
}
export const allFolders = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  filterFolders?: FilterFoldersProps | undefined
) => {
  const allFolders: FolderAndDocumentsProps[] = [];
  const folderNamePath = undefined;
  if (filterFolders) {
    if (!Array.isArray(filterFolders.folders)) {
      //map to array, this is compatible with old usage, example below.
      //folders = {"Policy": {"Applications"}}
      const folderArray: string[] = [];
      filterFoldersRecursive(filterFolders.folders, folderArray, undefined);
      filterFolders.folders = folderArray;
    }
  }
  allFoldersRecursive(
    foldersAndDocuments,
    allFolders,
    null,
    filterFolders,
    folderNamePath
  );
  return allFolders;
};
const filterFoldersRecursive = (
  folders: any,
  folderArray: string[],
  parentFolderPath: string | undefined
) => {
  if (!folders) {
    return;
  }
  const keys = Object.keys(folders);

  if (keys && keys.length > 0) {
    keys.forEach((one: string) => {
      const path = parentFolderPath ? `${parentFolderPath}.${one}` : one;
      folderArray.push(path);
      filterFoldersRecursive(folders[one], folderArray, path);
    });
  }
};
const allFoldersRecursive = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  allFolders: FolderAndDocumentsProps[],
  parentFolderAndDocuments: FolderAndDocumentsProps | null | undefined,
  filterFolders?: FilterFoldersProps | undefined,
  folderNamePath?: string | undefined
) => {
  for (const oneFolderAndDocuments of foldersAndDocuments) {
    let shouldAdd = true;
    const folderName = oneFolderAndDocuments.folderName;
    const path = folderNamePath
      ? `${folderNamePath}.${folderName}`
      : folderName;
    if (filterFolders) {
      const mode = filterFolders.mode ? filterFolders.mode : "include";
      const folders = filterFolders.folders;
      const isIncludes = folders.includes(path);
      let isIncludesRecursive = false;
      let isExcludesRecursive = false;
      folders.forEach((one: string) => {
        if (path.startsWith(one)) {
          isIncludesRecursive = true;
          isExcludesRecursive = true;
        }
      });
      switch (mode) {
        case "include":
          shouldAdd = isIncludes;
          break;
        case "exclude":
          shouldAdd = !isIncludes;
          break;
        case "includeRecursive":
          shouldAdd = isIncludesRecursive;
          break;
        case "excludeRecursive":
          shouldAdd = !isExcludesRecursive;
          break;
        default:
          break;
      }
    }
    if (shouldAdd) {
      const newFolderAndDocuments = {
        ...oneFolderAndDocuments,
        parentFolderId: parentFolderAndDocuments
          ? parentFolderAndDocuments.folderId
          : undefined,
        parentFolderName: parentFolderAndDocuments
          ? parentFolderAndDocuments.folderName
          : undefined
      };
      allFolders.push(newFolderAndDocuments);
    }
    const subFolders = oneFolderAndDocuments.subFolders;
    if (subFolders && Array.isArray(subFolders) && subFolders.length > 0) {
      allFoldersRecursive(
        subFolders,
        allFolders,
        oneFolderAndDocuments,
        filterFolders,
        path
      );
    }
  }
};
export const allDocuments = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  filterFolders?: FilterFoldersProps
) => {
  const allFlatFolders = allFolders(foldersAndDocuments, filterFolders);
  const allDocuments: DocumentsProps[] = [];
  allFlatFolders.forEach((one: FolderAndDocumentsProps) => {
    let documents = one.documents;
    documents = documents.map((document: DocumentsProps) => {
      return {
        ...document,
        parentFolderName: one.folderName,
        parentFolderId: one.folderId
      };
    });
    allDocuments.push(...documents);
  });
  return allDocuments;
};
