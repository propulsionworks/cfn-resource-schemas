import inquirer from "inquirer";

/**
 * Ask the user a question.
 */
export async function choose<Key extends ChoiceKey>(
  question: string,
  choices: Choice<Key>[],
  defaultValue?: Key
): Promise<Key | undefined> {
  const result = await inquirer.prompt([
    {
      type: "expand",
      message: question,
      name: "answer",
      choices: choices.map((x) => ({ ...x, value: x.key })),
      default: defaultValue,
    },
  ]);
  return result.answer as Key;
}

type Choice<Key extends ChoiceKey> = {
  key: Key;
  name: string;
};

// inquirer types are horrendous so we need to replicate this here
type ChoiceKey =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
