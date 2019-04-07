CECS 545: Software Architecture - Calc Net

Usage Requirements:
    Supports systems of equations with at most 5 unique variables
    Supported Operators: +, *, ^
    At least 1 equation per unique variable
    At least n-1 variables explicitly set
    Only same case variables across input(s)

Running:
    To start calculating load factory.html into a web browser and input the statements 
    that need to be calculated. Ensure that all setup statements are processed first by placing 
    them before the more complex inputs. Inputs are processed one at a time and their results 
    can be seen in the table on Machine D. Once all inputs are processed the user will be p
    rompted to refresh the page before processing more inputs.

Third Party Referrences:
    - Bootstrap for styling HTML

Sample equation system:
    1. X=4
    2. Y=5
    3. Z=X^2+4*Y

Known Issues:
    - Lines between machines not implemented.
    - Data displayed in P Machine sometimes shows NAN