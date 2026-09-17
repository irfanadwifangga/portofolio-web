/**
 * The page's sections in order, with the dictionary key for each label.
 *
 * Shared by the header menu and the left rail, so the two can never list
 * different sections. The hashes are the section ids and stay English in both
 * languages.
 */
export const SECTIONS = [
  { key: "top", hash: "#top" },
  { key: "building", hash: "#building" },
  { key: "deepDives", hash: "#deep-dives" },
  { key: "sideProject", hash: "#side-project" },
  { key: "stack", hash: "#stack" },
  { key: "experience", hash: "#experience" },
  { key: "contact", hash: "#contact" }
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];
