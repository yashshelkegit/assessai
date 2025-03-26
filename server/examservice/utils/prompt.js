
module.exports.APTITUDE_TEMPLATE = `Generate an exam data for engineering students for testing their general aptitude based on topics quant, verbal and logical
[
  {
    "id": number,
    "type": "mcq" | "multiple" | "short" | "coding" | "numerical",
    "question": "string",
    "options": ["string", "string", "string", "string"] // include only for "mcq" and "multiple"
  },
  ...
]
`;