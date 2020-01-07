import {
  DocumentsProps,
  FolderAndDocumentsProps,
  FilterFoldersProps,
  allFolders
} from "./FoldersUtils";

/***
 * Filter documents based on configured folders and file types.
 * @param folderAndDocumentsProps, folders and documents from dxp.
 * @param config, (optional). If no config given, then all documents will be added. Config format is
 * {"ParentFolderName": {"SubFolderName": ["AttachmentTypeCd1", {"type": "contentType", "value": "application/pdf"}]}}
 *
 * Some notes for config:
 * 1. please given full path. for example, if you want to filter all documents in Policy/Application,
 * you must give {"Policy": {"Application": ""}}
 * 2. if you want to filter documents that contains subfolders, you can add "__types" to config:
 * {"Policy": {"Application":"", "__types": ["AttachmentTypeCd1"]}} //add types for Policy.
 */
export const allDocumentsV1 = (folderAndDocumentsProps: any, config?: any) => {
  const documents: any = [];
  allDocumentsV1Recursive(folderAndDocumentsProps, null, config, documents);
  return documents;
};
const filterFolderAndDocumentsV1 = (
  config: any,
  isFoundPath: any,
  currentDocuments: any,
  documents: any[]
) => {
  if (!config) {
    documents.push(...currentDocuments);
    return;
  }
  const documentsTypeConfig = isFoundPath
    ? Array.isArray(config[isFoundPath])
      ? config[isFoundPath]
      : config[isFoundPath].__types
    : null;
  if (isFoundPath) {
    if (!documentsTypeConfig) {
      documents.push(...currentDocuments);
    } else {
      const filterDocuments = currentDocuments.filter((one: any) => {
        let isValidDocument = false;
        documentsTypeConfig.forEach((two: any) => {
          if (typeof two === "string") {
            isValidDocument = one.attachmentTypeCd === two;
          } else {
            isValidDocument = one[two.type] === two.value;
          }
        });
        return isValidDocument;
      });
      documents.push(...filterDocuments);
    }
  }
};
const allDocumentsV1Recursive = (
  folderAndDocuments: any,
  parentFolderPath: any,
  config: any,
  documents: any[]
) => {
  if (!folderAndDocuments && !Array.isArray(folderAndDocuments)) {
    return;
  }
  for (const oneFolderAndDocuments of folderAndDocuments) {
    const folderName = oneFolderAndDocuments.folderName;
    const folderId = oneFolderAndDocuments.folderId;
    const path = parentFolderPath
      ? `${parentFolderPath}.${folderName}`
      : folderName;

    const subFolders = oneFolderAndDocuments.subFolders;
    const currentDocuments = oneFolderAndDocuments.documents.map((one: any) => {
      return {
        ...one,
        parentFolderName: folderName,
        parentFolderId: folderId
      };
    });

    const isFoundPath = Object.keys(config ? config : {}).find(
      (one: string) => one === folderName
    );
    filterFolderAndDocumentsV1(
      config,
      isFoundPath,
      currentDocuments,
      documents
    );

    if (subFolders && Array.isArray(subFolders) && subFolders.length > 0) {
      allDocumentsV1Recursive(
        subFolders,
        path,
        isFoundPath ? config[isFoundPath] : config,
        documents
      );
    }
  }
};

//TODO will add more function.
export const allDocumentsV2 = (
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
