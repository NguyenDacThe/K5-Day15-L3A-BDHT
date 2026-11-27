"""Run the supplemental D1 benchmark with the starter and separate output files."""

import sys
from pathlib import Path
from tempfile import mkdtemp

import run_eval


def main(args: list[str]) -> int:
    run_eval.BENCH = str(Path(__file__).resolve().with_name("benchmark-supplemental.csv"))
    if len(args) == 2 and args[0] == "--score":
        run_path = Path(args[1]).resolve()
        run_eval.TRACES = str(run_path.parent.parent / "traces")
        return run_eval.score(str(run_path))

    output_root = Path(mkdtemp(prefix="bdht-d1-eval-"))
    (output_root / "eval").mkdir()
    run_eval.ROOT = str(output_root)
    run_eval.TRACES = str(output_root / "traces")
    print(f"Thư mục kết quả benchmark bổ sung {output_root}")
    return run_eval.main(args)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
