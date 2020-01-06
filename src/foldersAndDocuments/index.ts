/***
 * Document properties for eis documents.
 */

interface DocumentsProps {
  documentId: string //identity
  fileName: string //short name of file
  creationDate: string // creation date
  fileSize?: number // file size(B)
  comment?: string // comment
  contentType?: string // file type(http format)
  attachmentTypeCd?: string | undefined | null //eis file type
  parentFolderName?: string //parent folder short name
  parentFolderId?: string //parent folder id
}
/***
* Document properties for eis documents.
*/
export interface FolderAndDocumentsProps {
  folderId: string // folder id
  folderName: string // folder name
  documents: DocumentsProps[] // documents
  subFolders?: FolderAndDocumentsProps[] //subFolders
  permission?: string //permission
  parentFolderId?: string //parent folder id
  parentFolderName?: string //parent folder short name
}
export interface FilterFoldersProps {
  /***
   * can be include, exclude, includeRecursive and excludeRecursive or undefined or null, default is include
   * */
  mode?:
      | 'include'
      | 'exclude'
      | 'includeRecursive'
      | 'excludeRecursive'
      | undefined
      | null
  folders: any
}

/**
* Find all folders based on configuration.
* @param foldersAndDocuments, folders and documents.
* @param filterFolders, filterFolder can be configured two way. 1. {mode: 'xxx', folders: folderObj} 2. folderObj
*  folderObj can be array or objects > 1.arrays: ["A", "A.B", "A.C"] 2.objects: {"A": {"B": "", "C": ""}}, This will
*  include A by default. If you don't use mode, we will use include as default.
*/
export const allFolders = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  filterFolders?: FilterFoldersProps | undefined | string[]
) => {
  const allFolders: FolderAndDocumentsProps[] = []
  const folderNamePath = undefined
  const folders: any[] = []
  let newFilterFolders: FilterFoldersProps | undefined = {
      mode: undefined,
      folders: folders
  }
  if (!filterFolders) {
      newFilterFolders = undefined
  } else {
      const inc = 'include'
      if (Array.isArray(filterFolders) || Array.isArray(filterFolders.folders)) {
          newFilterFolders.mode = Array.isArray(filterFolders) ? inc : filterFolders.mode ? filterFolders.mode : inc
          const array = Array.isArray(filterFolders) ? filterFolders : filterFolders.folders
          newFilterFolders.folders.push(...array)
      } else {
          const foldersObj = filterFolders.folders ? filterFolders.folders : filterFolders
          const folderArray: string[] = []
          filterFoldersRecursive(foldersObj, folderArray, undefined)
          newFilterFolders.folders.push(...folderArray)
          newFilterFolders.mode = filterFolders.folders ? filterFolders.mode ? filterFolders.mode : inc : inc
      }
  }

  allFoldersRecursive(
      foldersAndDocuments,
      allFolders,
      null,
      newFilterFolders,
      folderNamePath
  )
  return allFolders
}
const filterFoldersRecursive = (
  folders: any,
  folderArray: string[],
  parentFolderPath: string | undefined
) => {
  if (!folders || folders === '' || Array.isArray(folders)) {
      return
  }
  const keys = Object.keys(folders)

  if (keys && keys.length > 0) {
      keys.forEach((one: string) => {
          const path = parentFolderPath ? `${parentFolderPath}.${one}` : one
          folderArray.push(path)
          filterFoldersRecursive(folders[one], folderArray, path)
      })
  }
}
const allFoldersRecursive = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  allFolders: FolderAndDocumentsProps[],
  parentFolderAndDocuments: FolderAndDocumentsProps | null | undefined,
  filterFolders?: FilterFoldersProps | undefined,
  folderNamePath?: string | undefined
) => {
  for (const oneFolderAndDocuments of foldersAndDocuments) {
      let shouldAdd = true
      const folderName = oneFolderAndDocuments.folderName
      const path = folderNamePath
          ? `${folderNamePath}.${folderName}`
          : folderName
      if (filterFolders) {
          const mode = filterFolders.mode ? filterFolders.mode : 'include'
          const folders = filterFolders.folders
          const isIncludes = folders.includes(path)
          let isIncludesRecursive = false
          let isExcludesRecursive = false
          folders.forEach((one: string) => {
              if (path.startsWith(one)) {
                  isIncludesRecursive = true
                  isExcludesRecursive = true
              }
          })
          switch (mode) {
              case 'include':
                  shouldAdd = isIncludes
                  break
              case 'exclude':
                  shouldAdd = !isIncludes
                  break
              case 'includeRecursive':
                  shouldAdd = isIncludesRecursive
                  break
              case 'excludeRecursive':
                  shouldAdd = !isExcludesRecursive
                  break
              default:
                  break
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
          }
          allFolders.push(newFolderAndDocuments)
      }
      const subFolders = oneFolderAndDocuments.subFolders
      if (subFolders && Array.isArray(subFolders) && subFolders.length > 0) {
          allFoldersRecursive(
              subFolders,
              allFolders,
              oneFolderAndDocuments,
              filterFolders,
              path
          )
      }
  }
}
export const allDocuments = (
  foldersAndDocuments: FolderAndDocumentsProps[],
  filterFolders?: FilterFoldersProps
) => {
  const allFlatFolders = allFolders(foldersAndDocuments, filterFolders)
  const allDocuments: DocumentsProps[] = []
  allFlatFolders.forEach((one: FolderAndDocumentsProps) => {
      let documents = one.documents
      documents = documents.map((document: DocumentsProps) => {
          return {
              ...document,
              parentFolderName: one.folderName,
              parentFolderId: one.folderId
          }
      })
      allDocuments.push(...documents)
  })
  return allDocuments
}
