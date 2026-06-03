import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Jede Testdatei bekommt eine eigene temporäre SQLite-DB und einen Test-Token.
// Wird vor dem Import der DB-Module gesetzt (setupFiles laufen zuerst).
process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), "bk-test-")), "test.db");
process.env.ADMIN_TOKEN = "test-token";
