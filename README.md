# gitlab-mrs

Prints the description and URL of the MR associated with a given commit.

(Currently hard-coded to work only with https://gitlab.com/tezos/tezos. Could easily be generalized.)

## Installation

```
npm i -g gitlab-mr
```

## Usage

Pipe a list of commit SHA's into the program with `xargs`. E.g.:

```
git rev-list HEAD | xargs gitlab-mr
```
