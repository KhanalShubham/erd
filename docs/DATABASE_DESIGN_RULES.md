# CRITICAL DATABASE DESIGN RULES

When generating, modifying, explaining, or validating any ERD, relational schema, table definition, or database model, **DO NOT automatically add a separate ID column to every table.**

The schema must be derived from the actual business rules, cardinality, relationship type, uniqueness requirements, and normalization principles.

The AI MUST reason about the key structure before creating or recommending columns.

> ### Hard Constraint
> **Never add a separate `ID` column to a junction/associative table unless the business rules require an independently identifiable relationship row. First test whether the participating foreign keys form a composite primary key. A composite primary key is a complete and valid primary key.**

---

## 1. Primary Key Decision Rule

For every table, determine the primary key using this order:

1. Identify whether the entity has a natural candidate key.
2. Check whether the table is a junction/associative table.
3. Check whether a combination of existing foreign keys uniquely identifies each row.
4. Only introduce a surrogate ID such as `StudentID`, `EnrollmentID`, `OrderItemID`, etc. when there is a justified reason.

**NEVER add a surrogate primary key merely because "every table should have an ID."**

A primary key can be:
- A single attribute
- A composite key containing multiple attributes
- A surrogate key
- A natural key

The choice must be justified by the business rules.

---

## 2. Junction / Associative Table Rule

When resolving a many-to-many (M:N) relationship, create a junction table containing the foreign keys of the participating entities.

### Example:
- **STUDENT**: `StudentID PK`
- **COURSE**: `CourseID PK`
- **ENROLLMENT**: `StudentID FK`, `CourseID FK`

If the business rule is:
> *"One student can enroll in a particular course only once"*

then `(StudentID, CourseID)` **must be the COMPOSITE PRIMARY KEY.**

Do **NOT** additionally create `EnrollmentID PK` unless there is a specific business or technical requirement that justifies having a separate identifier.

#### Correct:
```text
ENROLLMENT
-------------------------
StudentID   PK, FK
CourseID    PK, FK
EnrollmentDate
Status
```

#### Incorrect / Redundant for this business rule:
```text
ENROLLMENT
-------------------------
EnrollmentID PK
StudentID FK
CourseID FK
EnrollmentDate
Status
```
*Reason: `EnrollmentID` is unnecessary if `StudentID` + `CourseID` already uniquely identifies the enrollment.*

---

## 3. Order Item / Line Item Rule

For order-processing examples, do not automatically create `OrderItemID`.

First determine whether a product can occur only once within an order.

If:
> *"An order contains a product at most once, and Quantity represents the number of units purchased"*

then `(OrderID, ProductID)` is a valid composite primary key.

#### Correct:
```text
ORDER_ITEM
-------------------------
OrderID     PK, FK
ProductID   PK, FK
Quantity
UnitPrice
```

Do **NOT** add `OrderItemID PK` unless the business rules require multiple separate lines containing the same `ProductID` within the same `OrderID`, or another specific requirement makes a separate identifier useful.

If the same product can legitimately appear multiple times in one order as separate line items, then the AI must explicitly state the business assumption that caused the key decision and may use:
```text
OrderItemID PK
OrderID FK
ProductID FK
```

---

## 4. Composite Primary Key Rule

**A composite primary key is NOT an inferior or incomplete primary key.**

If two or more attributes together uniquely identify a record, they can legitimately form the primary key.

### Examples:
- **ENROLLMENT**: `StudentID` + `CourseID`
- **ORDER_ITEM**: `OrderID` + `ProductID`
- **CLASS_SUBJECT**: `ClassID` + `SubjectID`
- **ROLE_PERMISSION**: `RoleID` + `PermissionID`

Do not introduce `EnrollmentID`, `OrderItemID`, `ClassSubjectID`, or `RolePermissionID` simply because the table contains multiple foreign keys. The existence of multiple foreign keys does **NOT** mean a separate surrogate primary key is required.

---

## 5. Foreign Key ≠ Primary Key

A foreign key and primary key have different purposes:
- A **foreign key** references a record in another table.
- A **primary key** uniquely identifies a record in the current table.

However, a foreign key **CAN** also be part of a primary key.

### Example:
```text
ENROLLMENT
StudentID PK, FK
CourseID PK, FK
```
Here:
- `StudentID` is an FK (references `STUDENT`) and part of PK (helps uniquely identify an enrollment).
- `CourseID` is an FK (references `COURSE`) and part of PK (helps uniquely identify an enrollment).

Do not incorrectly assume that an FK cannot also be a PK.

---

## 6. Unique Constraint vs Primary Key

Before introducing a surrogate ID, check whether an existing combination can naturally guarantee uniqueness.

If `UNIQUE(StudentID, CourseID)` represents the business rule and the table has another justified primary key, explain the difference between:
- Primary Key
- Composite Primary Key
- UNIQUE constraint

Do not create redundant identifiers without explaining why they are needed.

---

## 7. Many-to-Many Relationship Validation

Whenever an M:N relationship is identified:
1. Create an associative/junction table.
2. Move the primary keys of the participating entities into it as foreign keys.
3. Determine whether those foreign keys together uniquely identify the relationship instance.
4. If yes, use them as a composite primary key.
5. Only use a separate surrogate key if the business rules justify it.
6. Add additional relationship attributes such as `EnrollmentDate`, `Quantity`, `Grade`, `Status`, `UnitPrice`, etc.

Do not create a meaningless ID just to satisfy a generic template.

---

## 8. Business Rules Must Drive the Key Design

Before deciding the primary key, explicitly identify the relevant business rule:
- *"Each student can enroll in a course only once."* → `PRIMARY KEY (StudentID, CourseID)`
- *"An order can contain the same product only once, with Quantity representing how many units were ordered."* → `PRIMARY KEY (OrderID, ProductID)`

**NEVER silently assume a business rule when the distinction affects the primary key.**

---

## 9. Do Not Confuse Entity Identity with Relationship Identity

- **Entity table**: Usually represents an independently identifiable object (e.g. `STUDENT` with `StudentID PK`).
- **Junction table**: Represents a relationship between objects (e.g. `ENROLLMENT` with `StudentID PK, FK` & `CourseID PK, FK`).

The enrollment itself does not automatically require an `EnrollmentID`. The relationship is identified by the participating entities.

---

## 10. Relational Schema Must Match the ERD

When converting an ERD into relational tables:
- Do not invent attributes that were not justified.
- Do not remove attributes required by the business rules.
- Do not automatically add ID columns.
- Do not create duplicate primary-key mechanisms.
- Do not create unnecessary junction-table IDs.
- Preserve cardinality and optionality.
- Place foreign keys according to the relationship.
- Resolve M:N relationships using associative tables with valid primary keys.

---

## 11. Required Key Validation Before Output

For each table, resolve these questions before generating the schema:
- **A.** What does one row represent?
- **B.** What makes one row different from another?
- **C.** Which attribute(s) uniquely identify the row?
- **D.** Is this table an entity table or a junction/associative table?
- **E.** If it is a junction table, are the foreign keys together unique? If yes, use a composite primary key.
- **F.** Is any proposed ID redundant?
- **G.** Is there a business rule that justifies the proposed ID?
- **H.** Are all PK/FK labels correct?

---

## 12. Prohibited Reasoning

- ❌ *"Every table needs an ID, therefore I will add EnrollmentID."*
- ❌ *"OrderItem is a table, therefore it needs OrderItemID."*
- ❌ *"Composite keys are complicated, therefore use a single ID."*
- ❌ *"Every entity should have an auto-increment integer primary key."*

---

## 13. Prescribed Reasoning Order

```text
Business Rule
      ↓
What does one row represent?
      ↓
What makes the row unique?
      ↓
Candidate Key(s)
      ↓
Primary Key selection (Composite vs Natural vs Surrogate)
      ↓
Foreign Key relationships
      ↓
Check for redundancy
      ↓
Final relational schema
```

---

## 14. Canonical Examples

### A. University LMS: Student & Course
- Student can enroll in many courses.
- Course can have many students.
- A student can enroll in a particular course only once.

```text
STUDENT
-------------------------
StudentID       PK
Name
Email

COURSE
-------------------------
CourseID        PK
CourseName
CreditHours

ENROLLMENT
-------------------------
StudentID       PK, FK
CourseID        PK, FK
EnrollmentDate
Grade
Status
```

### B. E-Commerce: Order & Product
- An order contains a product at most once.
- Quantity represents units purchased.

```text
PURCHASE_ORDER
-------------------------
OrderID         PK
OrderDate
CustomerID      FK

PRODUCT
-------------------------
ProductID       PK
ProductName
Price

ORDER_ITEM
-------------------------
OrderID         PK, FK
ProductID       PK, FK
Quantity
UnitPrice
```

---

## 15. When a Surrogate ID IS Justified

A separate identifier may be appropriate when:
- The relationship itself must be referenced independently by other child tables.
- The same pair of foreign keys can legitimately occur multiple times (e.g. repeated doctor appointments for the same patient on different dates).
- There is a documented application requirement for a single-column identifier.
- The composite key would be excessively wide across many columns.

*Note: If using a surrogate key on a junction table, also enforce a `UNIQUE` constraint on the business candidate keys (e.g. `UNIQUE(StudentID, CourseID)`).*

---

## 16. Educational Explanation Rule

Always distinguish:
> **"Can this table have a primary key?"** *(Yes, every table must have a primary key)*
> vs.
> **"Does this table need a separate single-column ID?"** *(No, a composite primary key is a complete and valid primary key)*

---

## 17. Consistency & Correction Rule

If the system previously recommended or generated `EnrollmentID PK` or `OrderItemID PK` as default practice, explicitly identify that earlier design as redundant under the single-enrollment / single-line business rule and use the composite primary key.

---

## 18. Pre-Generation Self-Check Checklist

- [ ] What does one row represent?
- [ ] What is the candidate key?
- [ ] Is this an entity or junction table?
- [ ] Can existing attributes form a composite PK?
- [ ] Am I unnecessarily creating a surrogate ID?
- [ ] Are PK and FK labels correct?
- [ ] Can a FK also be part of the PK?
- [ ] Does the schema enforce the stated business rule?
- [ ] If I use a surrogate ID, why is it necessary?
- [ ] If I use a surrogate ID for a relationship, is a UNIQUE constraint still required?
- [ ] Does the relational schema accurately represent the ERD?
- [ ] Does the explanation agree with the actual schema?
- [ ] Am I making an assumption that changes the key design?
- [ ] If yes, have I explicitly stated that assumption?
