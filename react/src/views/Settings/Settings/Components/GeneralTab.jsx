import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import { Autocomplete, Box, Chip, TextField } from "@mui/material";

export default function GeneralTab({ settings, handleFunc, submit }) {
  return (
    <>
      <Container>
        <Form>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="company.currentcy">
                <Form.Label>{"Default Currency"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="AED,EUR,USD..."
                  value={settings.default_currency}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="company.limit">
                <Form.Label>{"Number of Data Per Page"}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="10,20,100..."
                  value={settings.num_data_per_page}
                  onChange={handleFunc}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              {/*<Box sx={{mt: 4}}>*/}
              {/*    <Autocomplete*/}
              {/*        name="associative_categories"*/}
              {/*        defaultValue={applicationSettings?.associative_categories}*/}
              {/*        value={applicationSettings?.associative_categories}*/}
              {/*        multiple*/}
              {/*        options={[]}*/}
              {/*        onChange={(event, newValue) => {*/}
              {/*            setApplicationSettings({*/}
              {/*                ...applicationSettings,*/}
              {/*                ['associative_categories']: newValue || ""*/}
              {/*            })*/}

              {/*        }}*/}
              {/*        freeSolo*/}
              {/*        renderTags={(value, getTagProps) =>*/}
              {/*            value.map((option, index) => (*/}
              {/*                <Chip variant="outlined" name="associative_categories"*/}
              {/*                      label={option} {...getTagProps({index})} />*/}
              {/*            ))*/}
              {/*        }*/}
              {/*        renderInput={(params) => (*/}
              {/*            <TextField*/}
              {/*                name="associative_categories"*/}
              {/*                {...params}*/}
              {/*                variant="filled"*/}
              {/*                label="Associative Categories"*/}
              {/*                placeholder="Associative Categories"*/}
              {/*            />*/}
              {/*        )}*/}
              {/*    />*/}
              {/*</Box>*/}
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
