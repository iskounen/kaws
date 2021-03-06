import * as csv from "csv-parser"
import * as fs from "fs"
import { Collection } from "../Entities/Collection"

export const convertCSVToJSON: (string) => Promise<Collection[]> = (
  path: string
) => {
  if (!path) {
    throw new Error("Must pass a collections csv file as an argument")
  }

  return new Promise((resolve, reject) => {
    const results: any[] = []

    fs.createReadStream(path)
      .pipe(csv())
      .on("data", data => results.push(data))
      .on("end", () => {
        if (results.length > 0) {
          const formattedCollections = results.map(
            ({
              title,
              slug,
              category,
              description,
              headerImage,
              credit,
              artist_ids,
              gene_ids,
              tag_id,
              keyword,
            }) =>
              ({
                title,
                slug,
                category,
                description,
                headerImage,
                credit,
                query: (artist_ids || gene_ids || tag_id || keyword) && {
                  artist_ids: artist_ids
                    ? artist_ids.split(",").map(a => a.trim())
                    : [],
                  gene_ids: gene_ids
                    ? gene_ids.split(",").map(a => a.trim())
                    : [],
                  tag_id,
                  keyword,
                },
              } as Collection)
          )

          resolve(formattedCollections)
        } else {
          resolve([])
        }
      })
      .on("err", reject)
  })
}
