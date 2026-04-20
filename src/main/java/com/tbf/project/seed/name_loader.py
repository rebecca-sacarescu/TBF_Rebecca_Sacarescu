def load_names_from_file(file_path: str) -> list[str]:
    names = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            name = line.strip()

            if not name:
                continue

            name = " ".join(name.split())

            if len(name.split()) < 2:
                continue

            names.append(name)

    unique_names = list(dict.fromkeys(names))

    return unique_names