export type SnippetLang = "typescript" | "java" | "python" | "go";

export interface CodeSnippet {
  id: SnippetLang;
  label: string;
  filename: string;
  badge?: string;
  code: string;
}

/**
 * The hero editor introduces the person, not a system — the same profile
 * modelled four times, once per language in the stack.
 *
 * Hard constraint: the panel never scrolls, so every snippet must stay within
 * ~56 columns and 19 lines. Keep new lines inside that budget or the panel
 * starts clipping.
 */
export const codeSnippets: CodeSnippet[] = [
  {
    id: "typescript",
    label: "TypeScript",
    filename: "profile.ts",
    code: `interface Profile {
  name: string;
  location: string;
  role: string;
  focus: string[];
  education: string;
}

const me: Profile = {
  name: "Irfana Dwi Fangga",
  location: "Bandar Lampung, ID",
  role: "Fullstack Developer",
  focus: ["Payments", "Real-time", "Concurrency"],
  education: "D3 IT @ Politeknik Negeri Lampung",
};

const introduce = () =>
  me.role + " from " + me.location;`,
  },
  {
    id: "java",
    label: "Java",
    filename: "Profile.java",
    code: `import java.util.List;

public record Profile(
    String name,
    String location,
    String role,
    List<String> focus
) {
    String introduce() {
        return role + " from " + location;
    }
}

var me = new Profile(
    "Irfana Dwi Fangga",
    "Bandar Lampung, ID",
    "Fullstack Developer",
    List.of("Spigot", "RCON", "Spring")
);`,
  },
  {
    id: "python",
    label: "Python",
    filename: "profile.py",
    code: `from dataclasses import dataclass

@dataclass
class Profile:
    name: str
    location: str
    role: str
    focus: list[str]
    education: str

    def introduce(self) -> str:
        return self.role + " from " + self.location

me = Profile(
    name="Irfana Dwi Fangga",
    location="Bandar Lampung, ID",
    role="Fullstack Developer",
    focus=["Django REST", "Celery", "Postgres"],
    education="D3 IT @ Politeknik Negeri Lampung",
)`,
  },
  {
    id: "go",
    label: "Go",
    filename: "profile.go",
    code: `package main

type Profile struct {
    Name     string
    Location string
    Role     string
    Focus    []string
}

func (p Profile) Introduce() string {
    return p.Role + " from " + p.Location
}

var me = Profile{
    Name:     "Irfana Dwi Fangga",
    Location: "Bandar Lampung, ID",
    Role:     "Fullstack Developer",
    Focus:    []string{"Go", "Concurrency"},
}`,
  },
];
