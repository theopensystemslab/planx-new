export const formatSearchPattern = (pattern: string) => {

    // split pattern by words and remove empty spaces
    const patternArray = pattern.split(" ").filter(Boolean)

    // In FuseJS extended search the character: ' 
    // is used for the include-match search option
    // so it will include this whole word in matching
    const formattedPattern = `'${patternArray.join(" '")}`

    return formattedPattern
}